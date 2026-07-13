export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  totalWinnings: number;
  createdAt: any;
}

export interface Player {
  playerId: string;
  name: string;
  team: string; // Used as Brand for cars
  role: 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper' | 'Hypercar' | 'Sports Car' | 'Luxury' | string;
  photoUrl?: string;
  country: string; // Used as Brand Logo/Name for cars
  stats: {
    runs?: number;
    avg?: number;
    sr?: number;
    centuries?: number;
    fifties?: number;
    wickets?: number;
    economy?: number;
    bowlAvg?: number;
    hauls?: number;
    hp?: number; // Car HP
    topSpeed?: number; // Car Top Speed
    value?: string; // Car Value
  };
  auctionScore: number;
  basePrice: number;
}

export interface Room {
  roomId: string;
  category?: 'ipl' | 'car' | 'real_estate';
  title?: string;
  hostId: string;
  playersCount: number;
  revealTimer: number;
  isPublic: boolean;
  status: 'waiting' | 'active' | 'finished';
  currentBidderId?: string | null;
  currentBidAmount?: number | null;
  currentPlayerId?: string | null;
  timerEnd?: number | null;
  players: { [uid: string]: { uid: string; displayName: string; photoURL?: string; isBot?: boolean } };
  squads: { [userId: string]: string[] };
  purses: { [userId: string]: number };
  auctionedPlayerIds: string[];
  skipVotes: string[];
  terminateVotes?: string[];
  createdAt: any;
}

export interface Message {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
  reactions?: { [emoji: string]: number };
}
