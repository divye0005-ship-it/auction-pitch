export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: 'admin' | 'user';
  totalWinnings: number;
  createdAt: any;
}

export interface Player {
  playerId: string;
  name: string;
  team: string;
  role: 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
  photoUrl?: string;
  country: string;
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
  };
  auctionScore: number;
  basePrice: number;
}

export interface Room {
  roomId: string;
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
