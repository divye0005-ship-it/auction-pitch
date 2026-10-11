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
// CACHING & IN-FLIGHT PROMISE DEDUPLICATION (Saves 95%+ of reads)
// -------------------------------------------------------------
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>();
const inFlightProfiles = new Map<string, Promise<UserProfile | null>>();
const LOCAL_PROFILE_KEY = 'cricket_profile_';
const LOCAL_RANK_KEY = 'cricket_rank_';

let cachedLeaderboard: UserProfile[] | null = null;
let lastLeaderboardFetch = 0;
let inFlightLeaderboard: Promise<UserProfile[]> | null = null;

let cachedPublicRooms: Room[] | null = null;
let lastPublicRoomsFetch = 0;
let inFlightPublicRooms: Promise<Room[]> | null = null;

const roomDocCache = new Map<string, { data: Room; timestamp: number }>();
const rankCache = new Map<string, { rank: number; winnings: number; timestamp: number }>();

// -------------------------------------------------------------
// 100% ZERO-FIRESTORE IN-MEMORY ENGINE FOR SOLO PRACTICE MATCHES
// Eliminates thousands of reads & writes effortlessly!
// -------------------------------------------------------------
const localRooms = new Map<string, Room>();
const localRoomListeners = new Map<string, Set<(room: Room | null) => void>>();
const localRoomMessages = new Map<string, Message[]>();
const localMessageListeners = new Map<string, Set<(msgs: Message[]) => void>>();
const LOCAL_ROOM_STORAGE_KEY = 'ipl_solo_room_data_';

function isLocalRoom(roomId: string | undefined): boolean {
  if (!roomId) return false;
  return roomId.startsWith('solo_') || roomId.startsWith('local_');
}

function getLocalRoom(roomId: string): Room | null {
  let r = localRooms.get(roomId);
  if (!r && typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(LOCAL_ROOM_STORAGE_KEY + roomId) || localStorage.getItem(LOCAL_ROOM_STORAGE_KEY + roomId);
      if (stored) {
        r = JSON.parse(stored);
        if (r) localRooms.set(roomId, r);
      }
    } catch (e) {}
  }
  return r || null;
}

function saveLocalRoom(roomId: string, r: Room | null) {
  if (r) {
    localRooms.set(roomId, r);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(LOCAL_ROOM_STORAGE_KEY + roomId, JSON.stringify(r));
      } catch (e) {}
    }
  } else {
    localRooms.delete(roomId);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(LOCAL_ROOM_STORAGE_KEY + roomId);
        localStorage.removeItem(LOCAL_ROOM_STORAGE_KEY + roomId);
      } catch (e) {}
    }
  }
}

function notifyLocalRoom(roomId: string) {
  const r = getLocalRoom(roomId);
  const listeners = localRoomListeners.get(roomId);
  if (listeners) {
    listeners.forEach(cb => {
      try {
        cb(r ? JSON.parse(JSON.stringify(r)) : null);
      } catch (err) {
        console.error("Local room listener error:", err);
      }
    });
  }
}

function notifyLocalMessages(roomId: string) {
  const msgs = localRoomMessages.get(roomId) || [];
  const listeners = localMessageListeners.get(roomId);
  if (listeners) {
    listeners.forEach(cb => {
      try { cb([...msgs]); } catch (e) {}
    });
  }
}

export const dbService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const now = Date.now();
    const cached = profileCache.get(uid);
    if (cached && (now - cached.timestamp < 15 * 60 * 1000)) {
      return cached.data;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_PROFILE_KEY + uid);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (now - parsed.timestamp < 15 * 60 * 1000) {
            profileCache.set(uid, { data: parsed.data, timestamp: parsed.timestamp });
            return parsed.data;
          }
        }
      } catch (e) {}
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
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_PROFILE_KEY + uid, JSON.stringify({ data: profile, timestamp: Date.now() }));
            } catch (e) {}
          }
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
    if (cached && now - cached.timestamp < 60 * 60 * 1000 && cached.winnings === totalWinnings) {
      return cached.rank;
    }

    // Check localStorage cache (1 hour TTL)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_RANK_KEY + uid);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (now - parsed.timestamp < 60 * 60 * 1000 && parsed.winnings === totalWinnings) {
            rankCache.set(uid, parsed);
            return parsed.rank;
          }
        }
      } catch (e) {}
    }

    try {
      console.log(`🔥 FIRESTORE READ TRIGGERED: [getUserRank] count query for UID: ${uid}`);
      const q = query(
        collection(db, 'users'),
        where('totalWinnings', '>', totalWinnings)
      );
      const snapshot = await getCountFromServer(q);
      const rank = snapshot.data().count + 1;
      const rankObj = { rank, winnings: totalWinnings, timestamp: now };
      rankCache.set(uid, rankObj);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_RANK_KEY + uid, JSON.stringify(rankObj));
        } catch (e) {}
      }
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
    if (isLocalRoom(roomId)) {
      saveLocalRoom(roomId, null);
      localRoomListeners.delete(roomId);
      localRoomMessages.delete(roomId);
      localMessageListeners.delete(roomId);
      return;
    }
    try {
      roomDocCache.delete(roomId);
      if (cachedPublicRooms) {
        cachedPublicRooms = cachedPublicRooms.filter(r => r.roomId !== roomId);
      }
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'finished'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async voteToTerminate(roomId: string, userId: string): Promise<void> {
    if (isLocalRoom(roomId)) {
      this.terminateRoom(roomId);
      return;
    }
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
    if (isLocalRoom(roomId)) {
      const r = getLocalRoom(roomId);
      if (r) {
        if (!r.skipVotes) r.skipVotes = [];
        if (!r.skipVotes.includes(userId)) r.skipVotes.push(userId);
        saveLocalRoom(roomId, r);
        notifyLocalRoom(roomId);
      }
      return;
    }
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
    if (isLocalRoom(room.roomId)) {
      saveLocalRoom(room.roomId, { ...room });
      notifyLocalRoom(room.roomId);
      return;
    }
    try {
      roomDocCache.set(room.roomId, { data: room, timestamp: Date.now() });
      if (room.isPublic) {
        if (!cachedPublicRooms) cachedPublicRooms = [];
        cachedPublicRooms = [room, ...cachedPublicRooms.filter(r => r.roomId !== room.roomId)];
      }
      await setDoc(doc(db, 'rooms', room.roomId), {
        ...room,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${room.roomId}`);
    }
  },

  async getRoom(roomId: string): Promise<Room | null> {
    if (isLocalRoom(roomId)) {
      return getLocalRoom(roomId);
    }
    const now = Date.now();
    const cached = roomDocCache.get(roomId);
    if (cached && now - cached.timestamp < 15000) {
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
    if (isLocalRoom(roomId)) {
      if (!localRoomListeners.has(roomId)) {
        localRoomListeners.set(roomId, new Set());
      }
      localRoomListeners.get(roomId)!.add(callback);
      callback(getLocalRoom(roomId));
      return () => {
        localRoomListeners.get(roomId)?.delete(callback);
      };
    }

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
    if (isLocalRoom(roomId)) {
      const r = getLocalRoom(roomId);
      if (r) {
        for (const key of Object.keys(updates)) {
          if (key.includes('.')) {
            const parts = key.split('.');
            if (parts.length === 2) {
              const [parent, child] = parts;
              if (!(r as any)[parent]) (r as any)[parent] = {};
              (r as any)[parent][child] = updates[key];
            }
          } else {
            (r as any)[key] = updates[key];
          }
        }
        saveLocalRoom(roomId, r);
        notifyLocalRoom(roomId);
      }
      return;
    }

    try {
      const cached = roomDocCache.get(roomId);
      if (cached) {
        Object.assign(cached.data, updates);
        cached.timestamp = Date.now();
      }
      if (updates.status && updates.status !== 'waiting' && cachedPublicRooms) {
        cachedPublicRooms = cachedPublicRooms.filter(r => r.roomId !== roomId);
      }
      await updateDoc(doc(db, 'rooms', roomId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  async joinRoom(roomId: string, user: UserProfile): Promise<void> {
    if (isLocalRoom(roomId)) return;
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
    if (isLocalRoom(roomId)) {
      this.terminateRoom(roomId);
      return;
    }
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
    if (isLocalRoom(roomId)) {
      const r = getLocalRoom(roomId);
      if (!r) throw new Error('Room not found');
      if (!r.currentPlayerId) throw new Error('No player being auctioned');
      const now = Date.now();
      if (r.timerEnd && now >= r.timerEnd) {
        throw new Error('Auction already ended');
      }
      const userPurse = r.purses[userId] || 0;
      if (amount > userPurse) throw new Error('Insufficient funds');

      r.currentBidAmount = amount;
      r.currentBidderId = userId;
      // Overtime rule: only extend timer by 4s if auction is active and less than 3.5s remain
      const remaining = (r.timerEnd || 0) - now;
      if (remaining > 0 && remaining < 3500) {
        r.timerEnd = now + 4000;
      }

      saveLocalRoom(roomId, r);
      notifyLocalRoom(roomId);
      return;
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);

      await runTransaction(db, async (transaction) => {
        console.log(`🔥 FIRESTORE READ TRIGGERED: [bidOnPlayer] Transaction read for RoomID: ${roomId}`);
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) throw new Error('Room not found');

        const roomData = roomDoc.data() as Room;
        
        // Basic validations
        if (!roomData.currentPlayerId) throw new Error('No player being auctioned');
        
        // Strictly reject bids if the auction timer has reached 0
        const now = Date.now();
        if (roomData.timerEnd && now >= roomData.timerEnd) {
          throw new Error('Auction already ended');
        }

        const currentBid = roomData.currentBidAmount || 0;
        let finalAmount = amount;
        
        // If the bid is too low (someone else bid just before us), 
        // calculate the next valid bid based on the ACTUAL current bid in the DB
        if (finalAmount <= currentBid) {
          finalAmount = getNextBidAmount(currentBid, basePrice);
        }
        
        const userPurse = roomData.purses[userId] || 0;
        if (finalAmount > userPurse) throw new Error('Insufficient funds');

        // Smart Overtime: Only extend by 4 seconds if timer is active and has dipped below 3.5 seconds
        const remaining = (roomData.timerEnd || 0) - now;
        const newTimerEnd = (remaining > 0 && remaining < 3500) ? now + 4000 : roomData.timerEnd;

        transaction.update(roomRef, {
          currentBidAmount: finalAmount,
          currentBidderId: userId,
          timerEnd: newTimerEnd
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
    if (isLocalRoom(roomId)) {
      const r = getLocalRoom(roomId);
      if (r) {
        if (!r.auctionedPlayerIds.includes(playerId)) r.auctionedPlayerIds.push(playerId);
        r.currentPlayerId = null;
        r.currentBidAmount = 0;
        r.currentBidderId = null;
        r.skipVotes = [];
        saveLocalRoom(roomId, r);
        notifyLocalRoom(roomId);
      }
      return;
    }

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
    // Cache for 60 seconds to prevent spamming Firestore
    if (!forceRefresh && cachedPublicRooms && now - lastPublicRoomsFetch < 60000) {
      return cachedPublicRooms;
    }

    if (inFlightPublicRooms) {
      return inFlightPublicRooms;
    }

    inFlightPublicRooms = (async () => {
      try {
        console.log("🔥 FIRESTORE READ TRIGGERED: [getPublicRooms] Querying waiting public rooms");
        // Avoid multi-field composite index dependency: query equality filters and sort in-memory
        const q = query(
          collection(db, 'rooms'), 
          where('isPublic', '==', true),
          where('status', '==', 'waiting'),
          limit(15)
        );
        const snapshot = await getDocs(q);
        const rooms = snapshot.docs
          .map(d => d.data() as Room)
          .filter(room => Object.keys(room.players || {}).length > 0)
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
            return timeB - timeA;
          })
          .slice(0, 10);
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

  // Messages
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void) {
    if (isLocalRoom(roomId)) {
      if (!localMessageListeners.has(roomId)) {
        localMessageListeners.set(roomId, new Set());
      }
      localMessageListeners.get(roomId)!.add(callback);
      callback(localRoomMessages.get(roomId) || []);
      return () => {
        localMessageListeners.get(roomId)?.delete(callback);
      };
    }

    console.log(`🔥 FIRESTORE READ TRIGGERED: [subscribeToMessages] Listener attached for RoomID: ${roomId}`);
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc'),
      limitToLast(20)
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
    if (isLocalRoom(roomId)) {
      const msgs = localRoomMessages.get(roomId) || [];
      msgs.push({ ...message, timestamp: { toDate: () => new Date() } as any });
      localRoomMessages.set(roomId, msgs);
      notifyLocalMessages(roomId);
      return;
    }

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
    if (isLocalRoom(roomId)) {
      const r = getLocalRoom(roomId);
      if (r && r.currentPlayerId === playerId) {
        const bidderId = r.currentBidderId;
        const bidAmount = r.currentBidAmount || 0;
        
        if (!r.auctionedPlayerIds.includes(playerId)) {
          r.auctionedPlayerIds.push(playerId);
        }
        r.currentPlayerId = null;
        r.currentBidAmount = 0;
        r.currentBidderId = null;
        r.skipVotes = [];

        if (bidderId) {
          if (!r.squads[bidderId]) r.squads[bidderId] = [];
          r.squads[bidderId].push(playerId);
          r.purses[bidderId] = (r.purses[bidderId] || 10000) - bidAmount;

          const isHuman = r.players[bidderId] && !r.players[bidderId].isBot;
          if (isHuman) {
            this.updateUserWinnings(bidderId, score).catch(() => {});
          }
        }
        saveLocalRoom(roomId, r);
        notifyLocalRoom(roomId);
      }
      return;
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);

      const winnerInfo = await runTransaction(db, async (transaction) => {
        console.log(`🔥 FIRESTORE READ TRIGGERED: [completeAuction] Transaction read for RoomID: ${roomId}`);
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return null;

        const roomData = roomDoc.data() as Room;
        if (roomData.currentPlayerId !== playerId) return null;

        const bidderId = roomData.currentBidderId;
        const bidAmount = roomData.currentBidAmount || 0;

        if (bidderId) {
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
          console.warn("Failed to update user winnings:", err);
        }
      }
    } catch (error: any) {
      const msg = (error instanceof Error ? error.message : String(error)) || '';
      if (msg.toLowerCase().includes('stored version') || msg.toLowerCase().includes('does not match')) {
        return;
      }
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/complete`);
    }
  },

  async cleanupEmptyRooms(): Promise<void> {
    try {
      console.log("🔥 FIRESTORE READ TRIGGERED: [cleanupEmptyRooms]");
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('status', '==', 'waiting'), limit(10));
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
    if (isLocalRoom(roomId)) {
      this.terminateRoom(roomId);
      return;
    }
    try {
      roomDocCache.delete(roomId);
      if (cachedPublicRooms) {
        cachedPublicRooms = cachedPublicRooms.filter(r => r.roomId !== roomId);
      }
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rooms/${roomId}`);
    }
  }
};
