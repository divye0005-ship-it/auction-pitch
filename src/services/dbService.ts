import { db, auth, runTransaction, increment, arrayUnion } from '../firebase';
import { 
  doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, getCountFromServer, orderBy, limit, limitToLast
} from 'firebase/firestore';
import { UserProfile, Room, Player, Message } from '../types';
import { getNextBidAmount } from '../lib/auctionUtils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  if (!errStr.includes('Quota')) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// CACHING & IN-FLIGHT PROMISE DEDUPLICATION (Saves 90%+ of reads)
// -------------------------------------------------------------
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>();
const inFlightProfiles = new Map<string, Promise<UserProfile | null>>();

let cachedLeaderboard: UserProfile[] | null = null;
let lastLeaderboardFetch = 0;
let inFlightLeaderboard: Promise<UserProfile[]> | null = null;

let cachedPublicRooms: Room[] | null = null;
let lastPublicRoomsFetch = 0;
let inFlightPublicRooms: Promise<Room[]> | null = null;

const roomDocCache = new Map<string, { data: Room; timestamp: number }>();
const rankCache = new Map<string, { rank: number; winnings: number; timestamp: number }>();

export const dbService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const now = Date.now();
    const cached = profileCache.get(uid);
    if (cached && (now - cached.timestamp < 5 * 60 * 1000)) {
      return cached.data;
    }

    if (inFlightProfiles.has(uid)) {
      return inFlightProfiles.get(uid)!;
    }

    const fetchPromise = (async () => {
      try {
        console.log(`🔥 FIRESTORE READ TRIGGERED: [getUserProfile] for UID: ${uid}`);
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          profileCache.set(uid, { data: profile, timestamp: Date.now() });
          return profile;
        }
        return null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${uid}`);
        return null;
      } finally {
        inFlightProfiles.delete(uid);
      }
    })();

    inFlightProfiles.set(uid, fetchPromise);
    return fetchPromise;
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      profileCache.set(profile.uid, { data: profile, timestamp: Date.now() });
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        totalWinnings: profile.totalWinnings || 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${profile.uid}`);
    }
  },

  async updateUserWinnings(uid: string, score: number): Promise<void> {
    try {
      const cached = profileCache.get(uid);
      if (cached) {
        cached.data.totalWinnings = (cached.data.totalWinnings || 0) + score;
        cached.timestamp = Date.now();
      }
      await updateDoc(doc(db, 'users', uid), {
        totalWinnings: increment(score)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async updateProfile(uid: string, data: { displayName?: string, photoURL?: string }): Promise<void> {
    try {
      const cached = profileCache.get(uid);
      if (cached) {
        if (data.displayName) cached.data.displayName = data.displayName;
        if (data.photoURL) cached.data.photoURL = data.photoURL;
        cached.timestamp = Date.now();
      }
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async isUsernameUnique(username: string, currentUid: string): Promise<boolean> {
    try {
      console.log(`🔥 FIRESTORE READ TRIGGERED: [isUsernameUnique] checking: "${username}"`);
      const q = query(collection(db, 'users'), where('displayName', '==', username), limit(2));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return true;
      return querySnapshot.docs.every(d => d.id === currentUid);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return false;
    }
  },

  async getLeaderboard(forceRefresh = false): Promise<UserProfile[]> {
    const now = Date.now();
    // Cache for 3 minutes to preserve quota unless explicitly requested after cooldown
    if (!forceRefresh && cachedLeaderboard && now - lastLeaderboardFetch < 3 * 60 * 1000) {
      return cachedLeaderboard;
    }

    if (inFlightLeaderboard) {
      return inFlightLeaderboard;
    }

    inFlightLeaderboard = (async () => {
      try {
        console.log("🔥 FIRESTORE READ TRIGGERED: [getLeaderboard] querying top 20 users");
        const q = query(
          collection(db, 'users'),
          orderBy('totalWinnings', 'desc'),
          limit(20) // Strictly top 20 to protect Firestore quota
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs
          .map(d => d.data() as UserProfile)
          .filter(u => u.role !== 'guest')
          .slice(0, 20);
          
        cachedLeaderboard = results;
        lastLeaderboardFetch = Date.now();
        return results;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
        return cachedLeaderboard || [];
      } finally {
        inFlightLeaderboard = null;
      }
    })();

    return inFlightLeaderboard;
  },

  async getUserRank(uid: string, totalWinnings: number): Promise<number | null> {
    // 1. If user has 0 winnings, no need to query Firestore aggregation (saves 1 read per new user)
    if (!totalWinnings || totalWinnings <= 0) {
      return null;
    }

    // 2. Check if user is already inside the cached top 20 leaderboard (ZERO Firestore reads)
    if (cachedLeaderboard && cachedLeaderboard.length > 0) {
      const idx = cachedLeaderboard.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        return idx + 1;
      }
    }

    const now = Date.now();
    const cached = rankCache.get(uid);
    // Return cached rank if fetched in last 5 minutes and winnings difference is zero
    if (cached && now - cached.timestamp < 5 * 60 * 1000 && cached.winnings === totalWinnings) {
      return cached.rank;
    }

    try {
      console.log(`🔥 FIRESTORE READ TRIGGERED: [getUserRank] count query for UID: ${uid}`);
      const q = query(
        collection(db, 'users'),
        where('totalWinnings', '>', totalWinnings)
      );
      const snapshot = await getCountFromServer(q);
      const rank = snapshot.data().count + 1;
      rankCache.set(uid, { rank, winnings: totalWinnings, timestamp: now });
      return rank;
    } catch (error) {
      return cached ? cached.rank : null;
    }
  },

  // Players
  async getAllPlayers(): Promise<Player[]> {
    return [];
  },

  async terminateRoom(roomId: string): Promise<void> {
    try {
      roomDocCache.delete(roomId);
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'finished'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async voteToTerminate(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        terminateVotes: arrayUnion(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/terminate`);
    }
  },

  async voteToSkip(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        skipVotes: arrayUnion(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/skip`);
    }
  },

  async seedPlayers(players: Player[]): Promise<void> {
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      players.forEach((player) => {
        const docRef = doc(db, 'players', player.playerId);
        batch.set(docRef, player);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'players');
    }
  },

  async deletePlayer(playerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'players', playerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `players/${playerId}`);
    }
  },

  // Rooms
  async createRoom(room: Room): Promise<void> {
    try {
      roomDocCache.set(room.roomId, { data: room, timestamp: Date.now() });
      await setDoc(doc(db, 'rooms', room.roomId), {
        ...room,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${room.roomId}`);
    }
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const now = Date.now();
    const cached = roomDocCache.get(roomId);
    if (cached && now - cached.timestamp < 6000) {
      return cached.data;
    }

    try {
      console.log(`🔥 FIRESTORE READ TRIGGERED: [getRoom] single get for RoomID: ${roomId}`);
      const docSnap = await getDoc(doc(db, 'rooms', roomId));
      if (docSnap.exists()) {
        const data = docSnap.data() as Room;
        roomDocCache.set(roomId, { data, timestamp: Date.now() });
        return data;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
      return null;
    }
  },

  subscribeToRoom(roomId: string, callback: (room: Room | null) => void) {
    console.log(`🔥 FIRESTORE READ TRIGGERED: [subscribeToRoom] Attached real-time listener for RoomID: ${roomId}`);
    return onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      console.log(`🔥 FIRESTORE READ TRIGGERED: [subscribeToRoom Snapshot Update] RoomID: ${roomId}`);
      const data = docSnap.exists() ? (docSnap.data() as Room) : null;
      if (data) {
        roomDocCache.set(roomId, { data, timestamp: Date.now() });
      }
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
    });
  },

  async updateRoom(roomId: string, updates: any): Promise<void> {
    try {
      const cached = roomDocCache.get(roomId);
      if (cached) {
        Object.assign(cached.data, updates);
        cached.timestamp = Date.now();
      }
      await updateDoc(doc(db, 'rooms', roomId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async joinRoom(roomId: string, user: UserProfile): Promise<void> {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`players.${user.uid}`]: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL },
        [`squads.${user.uid}`]: [],
        [`purses.${user.uid}`]: 10000
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      roomDocCache.delete(roomId);
      const { deleteField } = await import('firebase/firestore');
      await updateDoc(doc(db, 'rooms', roomId), {
        [`players.${userId}`]: deleteField(),
        [`squads.${userId}`]: deleteField(),
        [`purses.${userId}`]: deleteField()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async bidOnPlayer(roomId: string, userId: string, amount: number, revealTimer: number, basePrice: number, retryCount = 0): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);

      await runTransaction(db, async (transaction) => {
        console.log(`🔥 FIRESTORE READ TRIGGERED: [bidOnPlayer] Transaction read for RoomID: ${roomId}`);
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) throw new Error('Room not found');

        const roomData = roomDoc.data() as Room;
        
        // Basic validations
        if (!roomData.currentPlayerId) throw new Error('No player being auctioned');
        
        const currentBid = roomData.currentBidAmount || 0;
        let finalAmount = amount;
        
        // If the bid is too low (someone else bid just before us), 
        // calculate the next valid bid based on the ACTUAL current bid in the DB
        if (finalAmount <= currentBid) {
          finalAmount = getNextBidAmount(currentBid, basePrice);
        }
        
        const userPurse = roomData.purses[userId] || 0;
        if (finalAmount > userPurse) throw new Error('Insufficient funds');

        // Check if timer has expired (with 5s grace period for client clock difference)
        if (roomData.timerEnd && Date.now() > roomData.timerEnd + 5000) {
          throw new Error('Auction already ended');
        }

        transaction.update(roomRef, {
          currentBidAmount: finalAmount,
          currentBidderId: userId,
          timerEnd: Date.now() + (revealTimer * 1000)
        });
      });
    } catch (error: any) {
      const msg = (error instanceof Error ? error.message : String(error)) || '';
      const isContention = msg.toLowerCase().includes('stored version') || msg.toLowerCase().includes('does not match');
      const businessLogicErrors = ['Bid too low', 'Insufficient funds', 'Auction already ended', 'Room not found', 'No player being auctioned'];
      
      if (isContention && retryCount < 2) {
        await new Promise(r => setTimeout(r, 60 + Math.random() * 80));
        return this.bidOnPlayer(roomId, userId, amount, revealTimer, basePrice, retryCount + 1);
      }

      if (businessLogicErrors.includes(error.message) || isContention) {
        if (isContention) {
          throw new Error('Someone else bid just before you! Please try again.');
        }
        throw error;
      }
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/bid`);
    }
  },

  async skipPlayer(roomId: string, playerId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        auctionedPlayerIds: arrayUnion(playerId),
        currentPlayerId: null,
        currentBidAmount: 0,
        currentBidderId: null,
        skipVotes: []
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async getPublicRooms(forceRefresh = false): Promise<Room[]> {
    const now = Date.now();
    // Cache for 15 seconds to prevent spamming Firestore
    if (!forceRefresh && cachedPublicRooms && now - lastPublicRoomsFetch < 15000) {
      return cachedPublicRooms;
    }

    if (inFlightPublicRooms) {
      return inFlightPublicRooms;
    }

    inFlightPublicRooms = (async () => {
      try {
        console.log("🔥 FIRESTORE READ TRIGGERED: [getPublicRooms] Querying up to 20 waiting public rooms");
        const q = query(
          collection(db, 'rooms'), 
          where('isPublic', '==', true),
          where('status', '==', 'waiting'),
          orderBy('createdAt', 'desc'),
          limit(20) // Limited strictly to 20
        );
        const snapshot = await getDocs(q);
        const rooms = snapshot.docs
          .map(d => d.data() as Room)
          .filter(room => Object.keys(room.players || {}).length > 0)
          .slice(0, 15);
        cachedPublicRooms = rooms;
        lastPublicRoomsFetch = Date.now();
        return rooms;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'rooms');
        return cachedPublicRooms || [];
      } finally {
        inFlightPublicRooms = null;
      }
    })();

    return inFlightPublicRooms;
  },

  subscribeToUserRooms(userId: string, callback: (rooms: Room[]) => void) {
    console.log(`🔥 FIRESTORE READ TRIGGERED: [subscribeToUserRooms] Listener attached for UID: ${userId}`);
    const q = query(
      collection(db, 'rooms'),
      where('status', 'in', ['waiting', 'active']),
      limit(10)
    );
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs
        .map(d => d.data() as Room)
        .filter(room => room.players && room.players[userId]);
      callback(rooms);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });
  },

  // Messages: strictly limited to last 25 to avoid reading thousands of chat docs
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void) {
    console.log(`🔥 FIRESTORE READ TRIGGERED: [subscribeToMessages] Listener attached for RoomID: ${roomId}`);
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc'),
      limitToLast(25)
    );
    return onSnapshot(q, (snapshot) => {
      console.log(`🔥 FIRESTORE READ TRIGGERED: [subscribeToMessages Snapshot Update] RoomID: ${roomId}`);
      const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/messages`);
    });
  },

  async sendMessage(roomId: string, message: Message): Promise<void> {
    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        ...message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}/messages`);
    }
  },

  async completeAuction(roomId: string, playerId: string, score: number): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);

      const winnerInfo = await runTransaction(db, async (transaction) => {
        console.log(`🔥 FIRESTORE READ TRIGGERED: [completeAuction] Transaction read for RoomID: ${roomId}`);
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return null;

        const roomData = roomDoc.data() as Room;
        
        // If no player is currently being auctioned or it's a different player, abort
        if (roomData.currentPlayerId !== playerId) return null;

        const bidderId = roomData.currentBidderId;
        const bidAmount = roomData.currentBidAmount || 0;

        if (bidderId) {
          // SOLD
          transaction.update(roomRef, {
            auctionedPlayerIds: arrayUnion(playerId),
            currentPlayerId: null,
            [`squads.${bidderId}`]: arrayUnion(playerId),
            [`purses.${bidderId}`]: increment(-bidAmount),
            currentBidAmount: 0,
            currentBidderId: null,
            skipVotes: []
          });
          return { bidderId, isBot: roomData.players[bidderId]?.isBot };
        } else {
          // UNSOLD
          transaction.update(roomRef, {
            auctionedPlayerIds: arrayUnion(playerId),
            currentPlayerId: null,
            currentBidAmount: 0,
            currentBidderId: null,
            skipVotes: []
          });
          return null;
        }
      });

      if (winnerInfo && !winnerInfo.isBot) {
        try {
          const userRef = doc(db, 'users', winnerInfo.bidderId);
          await updateDoc(userRef, {
            totalWinnings: increment(score)
          });
        } catch (err) {
          console.warn("Failed to update user winnings, but player was claimed:", err);
        }
      }
    } catch (error: any) {
      const msg = (error instanceof Error ? error.message : String(error)) || '';
      if (msg.toLowerCase().includes('stored version') || msg.toLowerCase().includes('does not match')) {
        console.warn("Auction completion conflict (expected):", msg);
        return;
      }
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/complete`);
    }
  },

  async cleanupEmptyRooms(): Promise<void> {
    try {
      console.log("🔥 FIRESTORE READ TRIGGERED: [cleanupEmptyRooms]");
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('status', '==', 'waiting'), limit(15));
      const querySnapshot = await getDocs(q);
      
      const now = Date.now();
      const thirtyMinutesInMs = 30 * 60 * 1000;
      
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      let deletedCount = 0;

      querySnapshot.forEach((docSnap) => {
        const room = docSnap.data() as Room;
        const createdAt = room.createdAt?.toMillis ? room.createdAt.toMillis() : 0;
        const playersCount = Object.keys(room.players || {}).length;

        if (playersCount === 0 && (now - createdAt) > thirtyMinutesInMs) {
          batch.delete(docSnap.ref);
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`Cleaned up ${deletedCount} empty rooms.`);
      }
    } catch (error) {
      console.warn("Room cleanup failed:", error);
    }
  },

  async deleteRoom(roomId: string): Promise<void> {
    try {
      roomDocCache.delete(roomId);
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rooms/${roomId}`);
    }
  }
};
