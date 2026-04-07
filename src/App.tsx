import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from './firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { dbService } from './services/dbService';
import { IPL_PLAYERS } from './services/playerData';
import { UserProfile, Room, Player } from './types';
import RoomLobby from './components/RoomLobby';
import AuctionGameplay from './components/AuctionGameplay';
import ResultsScreen from './components/ResultsScreen';
import ChatPanel from './components/ChatPanel';
import Leaderboard from './components/Leaderboard';
import { Trophy, Plus, Users, LogIn, LogOut, Sun, Moon, Mail, ChevronRight, Play, LayoutDashboard, User as UserIcon, ArrowLeft, Award, Volume2, VolumeX, Zap, MessageSquare, Shield, Sparkles, Star, BookOpen, Info, HelpCircle, CheckCircle2, AlertCircle, Instagram, Send, Trash2 } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const Tutorial = ({ onBack }: { onBack: () => void }) => {
  const steps = [
    {
      title: "Join or Create",
      description: "Start by creating a private room for friends or join a public auction to compete with the community.",
      icon: Plus,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10"
    },
    {
      title: "The Bidding War",
      description: "Players are revealed one by one. Use your budget wisely! Each bid increases the price. Don't let your dream player go to a rival.",
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Squad Strategy",
      description: "You need a balanced team. Track your purse and squad requirements (Batters, Bowlers, All-rounders, WK).",
      icon: Shield,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      title: "Win the League",
      description: "After the auction, teams are ranked based on their total Auction Score. The highest score wins the championship!",
      icon: Trophy,
      color: "text-green-400",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-3 rounded-xl glass hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-black uppercase tracking-tighter font-display">How to Play</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden group"
          >
            <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <step.icon className={`w-7 h-7 ${step.color}`} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">{step.title}</h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">{step.description}</p>
            <div className="absolute top-4 right-4 text-4xl font-black text-white/5 font-display">0{idx + 1}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
        <h4 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          Pro Tips
        </h4>
        <ul className="space-y-3">
          {[
            "Watch the timer! Bids in the last 5 seconds reset the clock.",
            "AI Bots analyze your budget—they might try to make you overpay.",
            "Check the 'Auction Score' on player cards to see their true value.",
            "Use the chat to coordinate or distract your opponents."
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('ipl_auction_muted');
    return saved ? JSON.parse(saved) : false;
  });
  const [showBetaError, setShowBetaError] = useState(false);
  const [resumableRoom, setResumableRoom] = useState<Room | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      console.error('Global error caught:', event);
      setShowBetaError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const [guestGamePlayed, setGuestGamePlayed] = useState(() => {
    return localStorage.getItem('ipl_guest_played') === 'true';
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    localStorage.setItem('ipl_auction_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  const handleUpdateProfile = async () => {
    if (!user || isSavingProfile) return;
    if (!editName.trim()) {
      alert("Username cannot be empty!");
      return;
    }

    setIsSavingProfile(true);
    try {
      const isUnique = await dbService.isUsernameUnique(editName, user.uid);
      if (!isUnique) {
        alert("This username is already taken. Please choose another one.");
        return;
      }

      await dbService.updateProfile(user.uid, {
        displayName: editName,
        photoURL: editPhoto || user.photoURL
      });

      setUser({
        ...user,
        displayName: editName,
        photoURL: editPhoto || user.photoURL
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [joinCode, setJoinCode] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createOptions, setCreateOptions] = useState({ players: 5, timer: 15, isPublic: true, includeBots: false });
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [currentView, setCurrentView] = useState<'play' | 'rooms' | 'leaderboard' | 'profile'>('play');

  const testVoice = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance("Welcome to the IPL Auction. Voice test successful.");
    const voices = window.speechSynthesis.getVoices();
    const indianFemaleVoice = voices.find(v => 
      (v.lang.includes('IN') || v.name.toLowerCase().includes('india')) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('veena')) &&
      !v.name.toLowerCase().includes('google')
    ) || voices.find(v => 
      (v.lang.includes('IN') || v.name.toLowerCase().includes('india')) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('veena'))
    ) || voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-GB'));
    
    if (indianFemaleVoice) msg.voice = indianFemaleVoice;
    msg.rate = 1.0;
    msg.pitch = 1.05;
    window.speechSynthesis.speak(msg);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const profile = await dbService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.isAnonymous ? `Guest_${firebaseUser.uid.substring(0, 4)}` : (firebaseUser.displayName || 'Player'),
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              email: firebaseUser.email || '',
              role: firebaseUser.isAnonymous ? 'guest' : 'user',
              totalWinnings: 0,
              createdAt: null
            };
            await dbService.createUserProfile(newProfile);
            setUser(newProfile);
          }
          
          // Fetch rank
          const leaderboard = await dbService.getLeaderboard();
          const rank = leaderboard.findIndex(u => u.uid === firebaseUser.uid);
          if (rank !== -1) {
            setUserRank(rank + 1);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setLoginError('Failed to load user profile. Please check your internet connection.');
        }
      } else {
        setUser(null);
        setUserRank(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || room) {
      setResumableRoom(null);
      return;
    }

    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('status', 'in', ['waiting', 'active']));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeRooms = snapshot.docs.map(doc => doc.data() as Room);
      const myRoom = activeRooms.find(r => r.players && r.players[user.uid]);
      setResumableRoom(myRoom || null);
    });

    return () => unsubscribe();
  }, [user, room]);

  useEffect(() => {
    if (room?.roomId) {
      const unsubscribe = dbService.subscribeToRoom(room.roomId, (updatedRoom) => {
        setRoom(updatedRoom);
      });
      return () => unsubscribe();
    }
  }, [room?.roomId]);

  useEffect(() => {
    if (user) {
      const unsubscribePublic = dbService.subscribeToPublicRooms((rooms) => {
        setPublicRooms(rooms);
      });
      
      return () => {
        unsubscribePublic();
      };
    }
  }, [user]);

  useEffect(() => {
    const updateRank = async () => {
      if (!user) return;
      try {
        const leaderboard = await dbService.getLeaderboard();
        const rank = leaderboard.findIndex(u => u.uid === user.uid);
        if (rank !== -1) {
          setUserRank(rank + 1);
        }
      } catch (error) {
        console.error('Failed to update rank:', error);
      }
    };
    updateRank();
  }, [user?.totalWinnings]);

  useEffect(() => {
    const cleanupStaleRooms = async () => {
      if (!user) return;
      try {
        const querySnapshot = await getDocs(query(
          collection(db, 'rooms'),
          where('status', '==', 'active')
        ));
        
        const now = Date.now();
        for (const docSnap of querySnapshot.docs) {
          const roomData = docSnap.data() as Room;
          const players = Object.values(roomData.players);
          const hasRealPlayer = players.some(p => !p.isBot);
          
          // Terminate if:
          // 1. It has real players but has been active for more than 1 hour (stale)
          // 2. It has NO real players AND it's NOT a public bot-only auction (we want some bot auctions to persist)
          const isStale = roomData.createdAt && now - roomData.createdAt.toMillis() > 1 * 60 * 60 * 1000;
          const isBotOnly = !hasRealPlayer;
          
          if ((hasRealPlayer && isStale) || (isBotOnly && !roomData.isPublic)) {
            await dbService.terminateRoom(roomData.roomId);
          }
        }
      } catch (e) {
        console.error('Cleanup failed:', e);
      }
    };

    if (user) {
      cleanupStaleRooms();
      const interval = setInterval(cleanupStaleRooms, 15 * 60 * 1000); // Run every 15 mins
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const seedAndCleanup = async () => {
      try {
        const players = await dbService.getAllPlayers();
        const invalidPlayers = players.filter(p => p.name.includes('IPL Star') || p.playerId.startsWith('player-'));
        
        if (invalidPlayers.length > 0) {
          console.log('Cleaning up invalid players...');
          for (const p of invalidPlayers) {
            await dbService.deletePlayer(p.playerId);
          }
        }

        // Re-seed if we have fewer than 200 players (to ensure the new real players are added)
        if (players.length - invalidPlayers.length < 200) {
          console.log('Seeding players...');
          await dbService.seedPlayers(IPL_PLAYERS);
        }
      } catch (e) {
        console.error('Seeding/Cleanup failed:', e);
      }
    };
    if (user) {
      seedAndCleanup();
    }
  }, [user]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User cancelled or closed the popup, don't show an error message
        return;
      }
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError('This domain is not authorized in Firebase. Please add your Vercel domain to the "Authorized Domains" list in the Firebase Console.');
      } else {
        setLoginError('Login failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleGuestLogin = async () => {
    if (guestGamePlayed) {
      alert("You have already played your free guest game. Please sign in with Google to continue playing!");
      return;
    }
    setLoginError(null);
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Guest login error:', error);
      if (error.code === 'auth/admin-restricted-operation') {
        setLoginError('Guest Mode (Anonymous Auth) is not enabled in your Firebase Console. \n\nTo fix this:\n1. Go to Firebase Console > Authentication > Sign-in method\n2. Click "Add new provider"\n3. Select "Anonymous" and click "Enable"\n4. Save and try again.');
      } else {
        setLoginError('Guest login failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const isAdmin = (user?.email === 'divye0005@gmail.com') || (auth.currentUser?.email === 'divye0005@gmail.com');

  const handleDeleteRoom = async (roomId: string) => {
    if (!isAdmin) return;
    setDeletingRoomId(roomId);
  };

  const confirmDeleteRoom = async () => {
    if (!deletingRoomId) return;
    
    try {
      await dbService.deleteRoom(deletingRoomId);
      setPublicRooms(prev => prev.filter(r => r.roomId !== deletingRoomId));
      setDeletingRoomId(null);
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Failed to delete room.");
      setDeletingRoomId(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRoom(null);
  };

  useEffect(() => {
    if (room?.status === 'finished' && user?.role === 'guest') {
      localStorage.setItem('ipl_guest_played', 'true');
      setGuestGamePlayed(true);
    }
  }, [room?.status, user?.role]);

  useEffect(() => {
    // Initial cleanup
    dbService.cleanupEmptyRooms();
    
    // Periodic cleanup every 1 hour
    const cleanupInterval = setInterval(() => {
      dbService.cleanupEmptyRooms();
    }, 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user || isCreating) return;
    if (user.role === 'guest' && guestGamePlayed) {
      alert("You have already played your free guest game. Please sign in with Google to continue playing!");
      return;
    }
    setIsCreating(true);
    try {
      const roomId = generateRoomId();
      
      const players: any = { [user.uid]: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } };
      const squads: any = { [user.uid]: [] };
      const purses: any = { [user.uid]: 10000 };

      const newRoom: Room = {
        roomId,
        title: `${user.displayName}'s Auction`,
        hostId: user.uid,
        playersCount: createOptions.players,
        revealTimer: createOptions.timer,
        isPublic: createOptions.isPublic,
        status: 'waiting',
        players,
        squads,
        purses,
        auctionedPlayerIds: [],
        skipVotes: [],
        createdAt: null
      };
      await dbService.createRoom(newRoom);
      setRoom(newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePlaySolo = async () => {
    if (!user || isCreating) return;
    if (user.role === 'guest' && guestGamePlayed) {
      alert("You have already played your free guest game. Please sign in with Google to continue playing!");
      return;
    }
    setIsCreating(true);
    try {
      const roomId = generateRoomId();
      
      // Solo mode: 1 human + 1 bot (total 2 players)
      const players: any = { [user.uid]: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } };
      const squads: any = { [user.uid]: [] };
      const purses: any = { [user.uid]: 10000 };

      const botUid = `bot_${roomId}_1`;
      const bot = { 
        uid: botUid, 
        displayName: `Expert Bot`, 
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${botUid}`, 
        isBot: true 
      };
      players[bot.uid] = bot;
      squads[bot.uid] = [];
      purses[bot.uid] = 10000;

      const newRoom: Room = {
        roomId,
        title: `${user.displayName}'s Solo Auction`,
        hostId: user.uid,
        playersCount: 2,
        revealTimer: 10, // Faster timer for solo
        isPublic: false,
        status: 'active', // Start immediately
        players,
        squads,
        purses,
        auctionedPlayerIds: [],
        skipVotes: [],
        createdAt: null
      };
      await dbService.createRoom(newRoom);
      setRoom(newRoom);
    } catch (error) {
      console.error('Failed to start solo game:', error);
      alert('Failed to start solo game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoomById = async (id: string) => {
    if (!user) return;
    if (user.role === 'guest' && guestGamePlayed) {
      alert("You have already played your free guest game. Please sign in with Google to continue playing!");
      return;
    }
    const existingRoom = await dbService.getRoom(id.toUpperCase());
    if (!existingRoom) {
      alert("Room not found!");
      return;
    }
    const playersArr = Object.values(existingRoom.players);
    
    // If already in room, just set it and return
    if (existingRoom.players[user.uid]) {
      setRoom(existingRoom);
      return;
    }

    if (playersArr.length >= existingRoom.playersCount) {
      alert("Room is full!");
      return;
    }

    await dbService.joinRoom(existingRoom.roomId, user);
    setRoom({ 
      ...existingRoom, 
      players: { ...existingRoom.players, [user.uid]: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } },
      squads: { ...existingRoom.squads, [user.uid]: [] },
      purses: { ...existingRoom.purses, [user.uid]: 10000 }
    });
  };

  const handleJoinRoom = async () => {
    if (!user || !joinCode) return;
    await handleJoinRoomById(joinCode);
  };

  const handleLeaveRoom = async () => {
    if (!room || !user) return;
    const playersArr = Object.values(room.players);
    if (playersArr.length === 1) {
      // Delete room logic could go here
    } else {
      await dbService.leaveRoom(room.roomId, user.uid);
    }
    setRoom(null);
  };

  const handleVoteTerminate = async () => {
    if (!room || !user) return;
    const humanPlayers = (Object.values(room.players) as any[]).filter(p => !p.isBot);
    
    if (humanPlayers.length === 1) {
      // Solo play: terminate immediately
      await dbService.terminateRoom(room.roomId);
    } else {
      await dbService.voteToTerminate(room.roomId, user.uid);
    }
  };

  useEffect(() => {
    if (room && room.status === 'active') {
      const humanPlayers = (Object.values(room.players) as any[]).filter(p => !p.isBot);
      const votes = room.terminateVotes || [];
      if (votes.length >= humanPlayers.length && humanPlayers.length > 0) {
        dbService.terminateRoom(room.roomId);
      }
    }
  }, [room?.terminateVotes, room?.players, room?.status, room?.roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/10 rounded-full"></div>
          <div className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-500`}>
      {!user ? (
        <div className="min-h-screen flex flex-col items-center p-6 relative overflow-x-hidden">
          {/* Background Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-6xl relative z-10 pt-12 md:pt-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col items-center lg:items-start">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,242,255,0.3)]"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                
                <h1 className="text-[12vw] lg:text-[80px] font-black leading-[0.9] uppercase tracking-tighter text-center lg:text-left mb-8 font-display">
                  IPL Auction Simulator<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                    Bid. Build. Win.
                  </span>
                </h1>
                
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-12 text-center lg:text-left max-w-lg">
                  The Ultimate Real-Time Multiplayer Experience for the Next Generation of Fans. Join thousands of players in the most realistic IPL auction simulation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogin}
                    className="flex-1 group relative px-8 py-5 rounded-2xl bg-white text-black font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 overflow-hidden shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 group-hover:text-white transition-colors">Sign in with Google</span>
                    <LogIn className="w-5 h-5 relative z-10 group-hover:text-white transition-colors" />
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGuestLogin}
                    disabled={guestGamePlayed}
                    className={`flex-1 px-8 py-5 rounded-2xl glass font-black text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${guestGamePlayed ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                  >
                    <span>{guestGamePlayed ? 'Guest Limit Reached' : 'Play as Guest'}</span>
                    <Play className="w-5 h-5" />
                  </motion.button>
                </div>

                {guestGamePlayed && (
                  <p className="mt-4 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    Free guest game used. Please sign in to continue!
                  </p>
                )}

                {loginError && (
                  <div className="mt-8 max-w-md w-full p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center space-y-2">
                    <p>{loginError}</p>
                  </div>
                )}
                <div className="mt-12 hidden lg:block">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative glass-dark rounded-[2.5rem] p-4 border border-white/10 scale-90 origin-left">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview</span>
                      </div>
                      <div className="flex gap-6">
                        <div className="w-48 aspect-[3/4] rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-1">
                          <div className="w-full h-full rounded-[1.4rem] bg-[#050505] overflow-hidden flex flex-col">
                            <div className="h-1/2 bg-slate-800 relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Star className="w-12 h-12 text-yellow-400/20" />
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                <div className="h-2 w-12 bg-cyan-400/20 rounded"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="h-6 bg-white/5 rounded"></div>
                                <div className="h-6 bg-white/5 rounded"></div>
                                <div className="h-6 bg-white/5 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Current Bid</div>
                            <div className="text-2xl font-black text-white">₹14.50 Cr</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Highest Bidder</div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-500/20"></div>
                              <div className="h-2 w-16 bg-white/20 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bento-item glass-dark p-6 group hover:border-cyan-400/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Real-Time Bidding</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Experience the thrill of a live auction with millisecond-precision bidding against friends or AI.</p>
                  </div>
                  <div className="bento-item glass-dark p-6 group hover:border-purple-400/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Live Chat</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Sledge your opponents and discuss strategies in real-time with the built-in game chat.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-0 sm:pt-8">
                  <div className="bento-item glass-dark p-6 group hover:border-orange-400/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Player Cards</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Detailed player stats, auction scores, and high-quality visuals for over 200+ IPL stars.</p>
                  </div>
                  <div className="bento-item glass-dark p-6 group hover:border-green-400/50 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">Smart AI Bots</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Challenge our advanced AI strategists that analyze budget and player quality like pro managers.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Players', value: '10K+', icon: Users },
                { label: 'Auctions Held', value: '50K+', icon: Trophy },
                { label: 'Player Cards', value: '200+', icon: Sparkles },
                { label: 'Avg Rating', value: '4.9/5', icon: Star },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                  <stat.icon className="w-5 h-5 text-slate-500 mb-3" />
                  <div className="text-2xl font-black font-display text-white">{stat.value}</div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-24 flex flex-col items-center gap-6 pb-12">
              <a 
                href="mailto:divye0005@gmail.com?subject=IPL Auction Donation"
                className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-cyan-400 transition-all flex items-center gap-3 group"
              >
                <Mail className="w-4 h-4 group-hover:animate-bounce" />
                Support the developer
              </a>
            </div>
          </motion.div>
        </div>
      ) : !room ? (
        <div className="min-h-screen flex flex-col p-8 max-w-5xl mx-auto">
          {/* Header (Desktop Only) */}
          <div className="hidden md:flex items-center justify-between mt-12 mb-20">
            <div className="flex items-center gap-5">
              <div className="relative cursor-pointer group" onClick={() => setCurrentView('profile')}>
                <img src={user.photoURL} className="w-16 h-16 rounded-[1.5rem] border-2 border-cyan-500/50 p-1 group-hover:border-cyan-400 transition-all" alt="" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#050505]"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Welcome, Champ</span>
                <span className="text-2xl font-black uppercase font-display tracking-tight">{user.displayName}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`p-4 rounded-2xl glass transition-all ${isMuted ? 'text-red-500 bg-red-500/10' : 'text-cyan-500 hover:bg-cyan-500/10'}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <button 
                onClick={handleLogout} 
                className="p-4 rounded-2xl glass text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mt-6 mb-12">
            <h1 className="text-3xl font-black uppercase tracking-tighter font-display text-cyan-400">Auction Pitch Simulator</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`p-3 rounded-xl glass transition-all ${isMuted ? 'text-red-500' : 'text-cyan-500'}`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleLogout} 
                className="p-3 rounded-xl glass text-slate-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 pb-24 md:pb-0">
            {currentView === 'leaderboard' ? (
              <Leaderboard onBack={() => setCurrentView('play')} />
            ) : currentView === 'profile' ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-2xl bento-item glass-dark relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                  
                  <button 
                    onClick={() => setCurrentView('play')}
                    className="absolute top-8 left-8 p-3 rounded-xl glass hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Theme Toggle in Profile */}
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="absolute top-8 right-8 p-3 rounded-xl glass text-cyan-400 hover:scale-110 transition-all"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  <div className="flex flex-col items-center text-center pt-12 pb-8">
                    <div className="relative mb-8 group">
                      <img src={user.photoURL} className="w-32 h-32 rounded-[2.5rem] border-4 border-cyan-500/30 p-2 object-cover" alt="" />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-400 to-purple-600 p-3 rounded-2xl shadow-xl">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>
                                   {isEditingProfile ? (
                      <div className="w-full max-w-md space-y-6 mb-8">
                        <div className="flex flex-col items-start gap-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Username</label>
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black tracking-tight focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                            placeholder="Enter unique username"
                          />
                        </div>
                        
                        <div className="flex flex-col items-start gap-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Choose Avatar</label>
                          <div className="grid grid-cols-4 gap-3 w-full">
                            {[
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Casper',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver'
                            ].map((avatar) => (
                              <button
                                key={avatar}
                                onClick={() => setEditPhoto(avatar)}
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${editPhoto === avatar ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-400/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                              >
                                <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                              </button>
                            ))}
                          </div>
                          <div className="w-full flex flex-col gap-2">
                            <span className="text-[9px] font-bold text-slate-600 uppercase text-center">Or provide custom URL</span>
                            <input 
                              type="text"
                              value={editPhoto}
                              onChange={(e) => setEditPhoto(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-cyan-500 transition-all"
                              placeholder="https://example.com/photo.jpg"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={handleUpdateProfile}
                            disabled={isSavingProfile}
                            className="flex-1 py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isSavingProfile ? 'Saving...' : 'Save Profile'}
                          </button>
                          <button 
                            onClick={() => setIsEditingProfile(false)}
                            className="flex-1 py-4 rounded-2xl glass text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : showTutorial ? (
                      <div className="w-full px-8 pb-8">
                        <Tutorial onBack={() => setShowTutorial(false)} />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-4xl font-black uppercase tracking-tighter font-display mb-2">{user.displayName}</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mb-8">{user.email || 'Guest Account'}</p>

                        <div className="flex flex-wrap justify-center gap-4 mb-12">
                          {user.role !== 'guest' ? (
                            <button 
                              onClick={() => {
                                setEditName(user.displayName);
                                setEditPhoto(user.photoURL || '');
                                setIsEditingProfile(true);
                              }}
                              className="px-6 py-3 rounded-xl glass hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                              <UserIcon className="w-4 h-4" />
                              Edit Profile
                            </button>
                          ) : (
                            <div className="px-6 py-3 rounded-xl bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Guest (No Editing)
                            </div>
                          )}
                          <button 
                            onClick={() => setShowTutorial(true)}
                            className="px-6 py-3 rounded-xl glass hover:bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            How to Play
                          </button>
                          <button 
                            onClick={testVoice}
                            className="px-6 py-3 rounded-xl glass hover:bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <Volume2 className="w-4 h-4" />
                            Test Voice
                          </button>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-6 w-full">
                      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Winnings</span>
                        <div className="text-5xl font-black font-display text-cyan-400">{user.totalWinnings || 0}</div>
                        <span className="text-[9px] font-bold text-cyan-500/50 uppercase mt-2">Points Earned</span>
                      </div>
                      <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Rank</span>
                        <div className="text-5xl font-black font-display text-purple-400">#{userRank || '--'}</div>
                        <span className="text-[9px] font-bold text-purple-500/50 uppercase mt-2">Global Standing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentView === 'rooms' ? (
              <div className="bento-item glass-dark">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter font-display">Public Auctions</h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {publicRooms.length} Live Rooms
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {publicRooms.map((r, idx) => (
                      <motion.div 
                        key={r.roomId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-400/30 transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{r.title || `Room ${r.roomId}`}</span>
                            <span className="text-xl font-black font-display text-cyan-400">{r.roomId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRoom(r.roomId);
                                }}
                                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all z-20"
                                title="Delete Room (Admin Only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <div className="flex -space-x-3">
                              {(Object.values(r.players) as any[]).slice(0, 3).map((p, i) => (
                                <img key={i} src={p.photoURL} className="w-8 h-8 rounded-full border-2 border-[#050505]" alt="" />
                              ))}
                              {Object.values(r.players).length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#050505] flex items-center justify-center text-[10px] font-black">
                                  +{Object.values(r.players).length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Users className="w-4 h-4" />
                            {Object.values(r.players).length}/{r.playersCount}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Play className="w-4 h-4" />
                            {r.revealTimer}s
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleJoinRoomById(r.roomId)}
                          className="w-full py-3 rounded-xl bg-white/5 group-hover:bg-cyan-400 group-hover:text-black text-white font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Join Auction
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {publicRooms.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                      <Users className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">No public rooms available. Create one!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Resume Room Card */}
                <AnimatePresence>
                  {resumableRoom && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="md:col-span-12 bento-item bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-cyan-400/30 relative overflow-hidden group"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1 block">Active Session Found</span>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Resume Your Auction</h3>
                            <p className="text-slate-400 font-bold text-xs">Room: {resumableRoom.roomId} • {Object.keys(resumableRoom.players).length} Players</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setRoom(resumableRoom)}
                          className="w-full md:w-auto px-10 py-4 rounded-2xl bg-cyan-400 text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                        >
                          Resume Now
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Create Room Card */}
                <div className="md:col-span-12 bento-item glass-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-cyan-500/10 transition-all duration-700"></div>
                  
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter font-display">Create Room</h2>
                    <button 
                      onClick={() => setShowHowToPlay(!showHowToPlay)}
                      className="p-3 rounded-xl glass hover:bg-white/10 transition-all text-cyan-400 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <BookOpen className="w-4 h-4" />
                      How to Play
                    </button>
                  </div>

                  {showHowToPlay && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-10 p-6 rounded-2xl bg-white/5 border border-cyan-500/20 text-slate-300 text-xs space-y-4 leading-relaxed"
                    >
                      <h3 className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">How to IPL Auction</h3>
                      <ol className="space-y-3 list-decimal list-inside font-bold">
                        <li>Create room or join room from public or private room using your friends code.</li>
                        <li>You can create a room of 2, 3, 5, 10 and if you're in a hurry you can reduce the bid time to 10 seconds.</li>
                        <li>If you're playing alone, you can also create a room with bots. It's an IPL auction expert.</li>
                        <li>Place bids and win to add that particular player to your dream team.</li>
                        <li>The player with the highest total squad score wins the battle.</li>
                        <li>You can choose dark theme or white theme in the profile section.</li>
                        <li>You can also choose your name in the profile section.</li>
                      </ol>
                    </motion.div>
                  )}
                  
                  <div className="space-y-10 mb-12">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-white uppercase font-black tracking-[0.2em] mb-4">Max Players</span>
                      <div className="flex gap-3">
                        {[2, 3, 5, 10].map(n => (
                          <button 
                            key={n}
                            onClick={() => setCreateOptions({ ...createOptions, players: n })}
                            className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${createOptions.players === n ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,242,255,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[12px] text-white uppercase font-black tracking-[0.2em] mb-4">Bid Timer</span>
                      <div className="flex gap-3">
                        {[10, 15, 20].map(n => (
                          <button 
                            key={n}
                            onClick={() => setCreateOptions({ ...createOptions, timer: n })}
                            className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${createOptions.timer === n ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                            {n}s
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-[12px] text-white uppercase font-black tracking-[0.2em] mb-4">Room Visibility</span>
                      <div className="flex gap-3">
                        {[true, false].map(v => (
                          <button 
                            key={v ? 'public' : 'private'}
                            onClick={() => setCreateOptions({ ...createOptions, isPublic: v })}
                            className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all duration-300 ${createOptions.isPublic === v ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                            {v ? 'Public' : 'Private'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleCreateRoom}
                      disabled={isCreating}
                      className="w-full py-6 rounded-[1.5rem] bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Plus className="w-6 h-6" />
                      )}
                      {isCreating ? 'Launching...' : 'Create Multiplayer Room'}
                    </button>

                    <button 
                      onClick={handlePlaySolo}
                      disabled={isCreating}
                      className="w-full py-6 rounded-[1.5rem] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Play className="w-6 h-6 fill-current" />
                      )}
                      {isCreating ? 'Starting...' : 'Play Solo'}
                    </button>
                  </div>
                </div>

                {/* Join Room Card */}
                <div className="md:col-span-5 bento-item glass-dark flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 font-display">Join Room</h2>
                    <p className="text-slate-500 text-sm font-bold mb-8">Got a code? Enter it below to jump into the action.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <input 
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="CODE"
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-6 text-2xl font-black tracking-[0.5em] uppercase focus:outline-none focus:border-cyan-500 focus:bg-white/10 transition-all text-center"
                    />
                    <button 
                      onClick={handleJoinRoom}
                      className="w-full py-6 rounded-[1.5rem] bg-white text-black font-black text-lg tracking-widest uppercase flex items-center justify-center gap-4 hover:bg-cyan-400 hover:text-black transition-all"
                    >
                      Join Now
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 z-50">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <button 
                onClick={() => setCurrentView('play')}
                className={`flex flex-col items-center gap-1 transition-all ${currentView === 'play' ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                <div className={`p-2 rounded-xl ${currentView === 'play' ? 'bg-cyan-400/10' : ''}`}>
                  <Play className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Play</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('rooms')}
                className={`flex flex-col items-center gap-1 transition-all ${currentView === 'rooms' ? 'text-purple-400' : 'text-slate-500'}`}
              >
                <div className={`p-2 rounded-xl ${currentView === 'rooms' ? 'bg-purple-400/10' : ''}`}>
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Rooms</span>
              </button>

              <button 
                onClick={() => setCurrentView('leaderboard')}
                className={`flex flex-col items-center gap-1 transition-all ${currentView === 'leaderboard' ? 'text-yellow-400' : 'text-slate-500'}`}
              >
                <div className={`p-2 rounded-xl ${currentView === 'leaderboard' ? 'bg-yellow-400/10' : ''}`}>
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Ranks</span>
              </button>

              <button 
                onClick={() => setCurrentView('profile')}
                className={`flex flex-col items-center gap-1 transition-all ${currentView === 'profile' ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                <div className={`p-2 rounded-xl ${currentView === 'profile' ? 'bg-cyan-400/10' : ''}`}>
                  <UserIcon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
              </button>
            </div>
          </div>

          <div className="mt-20 text-center pb-12 flex flex-col items-center gap-6">
             <div className="flex flex-col items-center gap-6">
               <div className="flex flex-wrap justify-center gap-4">
                 <a 
                   href="https://www.instagram.com/divyay_18" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-pink-500/20 hover:text-pink-500 transition-all text-slate-300 flex items-center gap-3 border border-white/5"
                 >
                   <Instagram className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest">Join Us</span>
                 </a>
                 <a 
                   href="https://t.me/+SFengSbGUOUyNmQ1" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-500 transition-all text-slate-300 flex items-center gap-3 border border-white/5"
                 >
                   <Send className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest">Join Us</span>
                 </a>
               </div>
             </div>
             
             <a 
                href="mailto:divye0005@gmail.com?subject=IPL Auction Donation"
                className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-cyan-400 transition-all flex items-center justify-center gap-3"
              >
                <Mail className="w-4 h-4" />
                Support the developer
              </a>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col">
          {room.status === 'waiting' ? (
            <RoomLobby room={room} user={user} onLeave={handleLeaveRoom} />
          ) : room.status === 'active' ? (
            <AuctionGameplay 
              room={room} 
              user={user} 
              setRoom={setRoom}
              allPlayers={IPL_PLAYERS} 
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onQuit={() => setRoom(null)} 
              onVoteTerminate={handleVoteTerminate}
            />
          ) : (
            <ResultsScreen room={room} user={user} allPlayers={IPL_PLAYERS} onHome={() => setRoom(null)} />
          )}
          
          {room.status !== 'finished' && (
            <ChatPanel roomId={room.roomId} userId={user.uid} userName={user.displayName} />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingRoomId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-dark p-8 rounded-[2.5rem] border border-red-500/20 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Delete Room?</h3>
              <p className="text-slate-400 font-bold text-sm mb-8">Are you sure you want to delete room <span className="text-red-400">{deletingRoomId}</span>? This action cannot be undone.</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setDeletingRoomId(null)}
                  className="flex-1 py-4 rounded-2xl glass hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteRoom}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Delete Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beta Error Modal */}
      <AnimatePresence>
        {showBetaError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md glass-dark p-8 rounded-[2.5rem] border border-red-500/20 text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4">System Interruption</h2>
              <p className="text-slate-400 font-bold mb-8">
                Sorry for interruption we are in beta phase now.
              </p>
              <button 
                onClick={() => setShowBetaError(false)}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest transition-all"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SpeedInsights />
    </div>
  );
}
