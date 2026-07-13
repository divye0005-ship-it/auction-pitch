const fs = require('fs');
let content = fs.readFileSync('src/services/dbService.ts', 'utf-8');

// Insert after import statements (assuming around line 8)
const replacement = `import { Room, UserProfile } from '../types';
import { generateRoomId } from '../lib/auctionUtils';`;
content = content.replace(/import \{ Room, UserProfile \} from '\.\.\/types';/, replacement);

const presenceMethods = `
  async updatePresence(uid: string, mode: string): Promise<void> {
    try {
      await setDoc(doc(db, 'presence', uid), { mode, lastSeen: serverTimestamp() }, { merge: true });
    } catch (e) {}
  },
  async removePresence(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'presence', uid));
    } catch (e) {}
  },
  async findAvailableRoom(category: string): Promise<string | null> {
    try {
      const q = query(collection(db, 'rooms'), where('category', '==', category), where('status', '==', 'waiting'), where('isPublic', '==', true));
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Find one with < max players
        for (const d of snap.docs) {
          const room = d.data() as Room;
          const humanPlayers = Object.values(room.players).filter((p: any) => !p.isBot).length;
          if (humanPlayers < room.playersCount) {
            return room.roomId;
          }
        }
      }
      return null;
    } catch (e) { return null; }
  },
  async createMatchmakingRoom(category: string, user: UserProfile): Promise<string> {
    const roomId = generateRoomId();
    const newRoom: Room = {
      roomId,
      category,
      title: \`\${category.toUpperCase()} Match\`,
      hostId: user.uid,
      playersCount: 2,
      revealTimer: 10,
      isPublic: true,
      status: 'waiting',
      players: { [user.uid]: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } },
      squads: { [user.uid]: [] },
      purses: { [user.uid]: 10000 },
      auctionedPlayerIds: [],
      skipVotes: [],
      createdAt: serverTimestamp() as any
    };
    await setDoc(doc(db, 'rooms', roomId), newRoom);
    return roomId;
  },
  async startMatchmakingRoom(roomId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'rooms', roomId), { status: 'active' });
    } catch(e) {}
  },
`;

content = content.replace("export const dbService = {", "export const dbService = {" + presenceMethods);
fs.writeFileSync('src/services/dbService.ts', content);
console.log('dbService patched');
