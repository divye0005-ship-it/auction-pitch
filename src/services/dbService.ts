import { db, auth } from '../firebase';
import { 
  doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp 
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
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
      const user = await this.getUserProfile(uid);
      if (user) {
        await updateDoc(doc(db, 'users', uid), {
          totalWinnings: (user.totalWinnings || 0) + score
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async updateProfile(uid: string, data: { displayName?: string, photoURL?: string }): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async isUsernameUnique(username: string, currentUid: string): Promise<boolean> {
    try {
      const q = query(collection(db, 'users'), where('displayName', '==', username));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return true;
      // If there's a match, check if it's the current user
      return querySnapshot.docs.every(doc => doc.id === currentUid);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return false;
    }
  },

  async getLeaderboard(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('totalWinnings', '>', 0)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => doc.data() as UserProfile)
        .sort((a, b) => (b.totalWinnings || 0) - (a.totalWinnings || 0));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },

  // Players
  async getAllPlayers(): Promise<Player[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'players'));
      return querySnapshot.docs.map(doc => doc.data() as Player);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'players');
      return [];
    }
  },

  async terminateRoom(roomId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'finished'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
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
      await setDoc(doc(db, 'rooms', room.roomId), {
        ...room,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${room.roomId}`);
    }
  },

  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const docSnap = await getDoc(doc(db, 'rooms', roomId));
      return docSnap.exists() ? (docSnap.data() as Room) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
      return null;
    }
  },

  subscribeToRoom(roomId: string, callback: (room: Room | null) => void) {
    return onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      callback(docSnap.exists() ? (docSnap.data() as Room) : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
    });
  },

  async updateRoom(roomId: string, updates: any): Promise<void> {
    try {
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

  async bidOnPlayer(roomId: string, userId: string, amount: number, revealTimer: number, basePrice: number): Promise<void> {
    try {
      const { runTransaction } = await import('firebase/firestore');
      const roomRef = doc(db, 'rooms', roomId);

      await runTransaction(db, async (transaction) => {
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

        // Check if timer has expired (using local time as proxy, but transaction helps)
        if (roomData.timerEnd && Date.now() > roomData.timerEnd + 1000) {
          throw new Error('Auction already ended');
        }

        transaction.update(roomRef, {
          currentBidAmount: finalAmount,
          currentBidderId: userId,
          timerEnd: Date.now() + (revealTimer * 1000)
        });
      });
    } catch (error: any) {
      // Don't use handleFirestoreError for business logic errors
      const businessLogicErrors = ['Bid too low', 'Insufficient funds', 'Auction already ended', 'Room not found', 'No player being auctioned'];
      if (businessLogicErrors.includes(error.message)) {
        throw error;
      }
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/bid`);
    }
  },

  async skipPlayer(roomId: string, playerId: string, auctionedPlayerIds: string[]): Promise<void> {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        auctionedPlayerIds: [...auctionedPlayerIds, playerId],
        currentPlayerId: null,
        currentBidAmount: 0,
        currentBidderId: null,
        skipVotes: []
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    }
  },

  subscribeToPublicRooms(callback: (rooms: Room[]) => void) {
    const q = query(
      collection(db, 'rooms'), 
      where('isPublic', '==', true),
      where('status', '==', 'waiting')
    );
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs
        .map(doc => doc.data() as Room)
        .filter(room => Object.keys(room.players || {}).length > 0); // Only show if someone is playing
      callback(rooms);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });
  },

  subscribeToUserRooms(userId: string, callback: (rooms: Room[]) => void) {
    const q = query(
      collection(db, 'rooms'),
      where('status', 'in', ['waiting', 'active'])
    );
    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs
        .map(doc => doc.data() as Room)
        .filter(room => room.players[userId]);
      callback(rooms);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });
  },

  // Messages
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void) {
    const q = query(collection(db, 'rooms', roomId, 'messages'), where('timestamp', '!=', null));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(messages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)));
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
      const { runTransaction, arrayUnion, increment } = await import('firebase/firestore');
      const roomRef = doc(db, 'rooms', roomId);

      const winnerInfo = await runTransaction(db, async (transaction) => {
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

      // Update user winnings separately after transaction succeeds
      // This ensures that even if profile update fails, the player is still claimed in the room
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
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/complete`);
    }
  }
};
