import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from './firebase';
import { collection, query, where, getDocs, onSnapshot, limit } from 'firebase/firestore';
import { dbService } from './services/dbService';
import { IPL_PLAYERS } from './services/playerData';
import { UserProfile, Room, Player } from './types';
import RoomLobby from './components/RoomLobby';
import AuctionGameplay from './components/AuctionGameplay';
import ResultsScreen from './components/ResultsScreen';
import ChatPanel from './components/ChatPanel';
import Leaderboard from './components/Leaderboard';
import { Trophy, Plus, Users, LogIn, LogOut, Sun, Moon, Mail, ChevronRight, Play, LayoutDashboard, User as UserIcon, ArrowLeft, Award, Volume2, VolumeX, Zap, MessageSquare, Shield, Sparkles, Star, BookOpen, Info, HelpCircle, CheckCircle2, AlertCircle, Instagram, Send, Trash2, ExternalLink, Wallet, TrendingUp, ShieldCheck, X, Share2, Copy, Check, Heart, Coffee } from 'lucide-react';
import HowIplMegaAuctionWorks from './pages/HowIplMegaAuctionWorks';
import IplAuctionRulesGuide from './pages/IplAuctionRulesGuide';
import IplAuctionGameFriends from './pages/IplAuctionGameFriends';
import CricketManagerGameOnline from './pages/CricketManagerGameOnline';
import AboutCreator from './pages/AboutCreator';

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

  const [lastFinishedRoomId, setLastFinishedRoomId] = useState<string | null>(null);

  const [showBetaError, setShowBetaError] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedTipAmount, setSelectedTipAmount] = useState<number>(50);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('https://auctionpitch.vercel.app/');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText('divye64@oksbi');
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch (err) {
      console.error('Failed to copy UPI ID', err);
    }
  };

  useEffect(() => {
    if (room?.status === 'finished' && room.roomId !== lastFinishedRoomId) {
      setShowSupportModal(true);
      setLastFinishedRoomId(room.roomId);
    }
  }, [room?.status, room?.roomId, lastFinishedRoomId]);
  const [showQR, setShowQR] = useState(false);
  const [resumableRoom, setResumableRoom] = useState<Room | null>(null);
  const [latestPublicRoom, setLatestPublicRoom] = useState<Room | null>(null);
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
          const rank = await dbService.getUserRank(firebaseUser.uid, profile ? (profile.totalWinnings || 0) : 0);
          if (rank !== null) {
            setUserRank(rank);
          }
        } catch (error: any) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          if (errorMsg.includes('Quota')) {
            setLoginError('Service temporarily unavailable due to high traffic reaching database limits. Please try again tomorrow when quotas reset.');
          } else {
            console.error('Auth state change error:', error);
            setLoginError('Failed to load user profile. Please check your internet connection.');
          }
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
    if (!user?.uid || room) {
      setResumableRoom(null);
      setLatestPublicRoom(null);
      return;
    }

    const fetchRoomsInfo = async () => {
      try {
        // FAST PATH: use localStorage to resume room
        const savedRoomId = localStorage.getItem('activeRoomId');
        if (savedRoomId) {
          const roomData = await dbService.getRoom(savedRoomId);
          if (roomData && ['waiting', 'active'].includes(roomData.status)) {
            if (roomData.players && roomData.players[user.uid]) {
              setResumableRoom(roomData);
              return;
            }
          } else {
            localStorage.removeItem('activeRoomId');
          }
        }
        
        // Visual fallback: only fetch 1 public room if no resumable room exists
        const pubRooms = await dbService.getPublicRooms();
        if (pubRooms.length > 0) {
          setLatestPublicRoom(pubRooms[0]);
        } else {
          setLatestPublicRoom(null);
        }
      } catch (err) {
        console.error("Failed to fetch initial rooms state", err);
      }
    };

    fetchRoomsInfo();
  }, [user?.uid, room?.roomId]);

  useEffect(() => {
    if (room?.roomId && ['waiting', 'active'].includes(room.status)) {
      localStorage.setItem('activeRoomId', room.roomId);
    }
  }, [room?.roomId, room?.status]);

  useEffect(() => {
    if (room?.roomId) {
      const unsubscribe = dbService.subscribeToRoom(room.roomId, (updatedRoom) => {
        if (updatedRoom) {
          setRoom(updatedRoom);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [room?.roomId]);

  const fetchPublicRooms = async () => {
    if (user?.uid) {
      const rooms = await dbService.getPublicRooms();
      setPublicRooms(rooms);
    }
  };

  // Only query public rooms when the user opens the rooms directory view
  useEffect(() => {
    if (user?.uid && currentView === 'rooms') {
      fetchPublicRooms();
    }
  }, [user?.uid, currentView]);

  useEffect(() => {
    const updateRank = async () => {
      if (!user?.uid) return;
      try {
        const rank = await dbService.getUserRank(user.uid, user.totalWinnings || 0);
        if (rank !== null) {
          setUserRank(rank);
        }
      } catch (error) {
        console.error('Failed to update rank:', error);
      }
    };
    updateRank();
  }, [user?.uid, user?.totalWinnings]);

  const cleanedUpUserRoomsRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user?.uid || cleanedUpUserRoomsRef.current === user.uid) return;
    cleanedUpUserRoomsRef.current = user.uid;

    const cleanupStaleRooms = async () => {
      try {
        const querySnapshot = await getDocs(query(
          collection(db, 'rooms'),
          where('status', '==', 'active'),
          where('hostId', '==', user.uid),
          limit(5)
        ));
        
        const now = Date.now();
        for (const docSnap of querySnapshot.docs) {
          const roomData = docSnap.data() as Room;
          const players = Object.values(roomData.players);
          const hasRealPlayer = players.some(p => !p.isBot);
          
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

    cleanupStaleRooms();
  }, [user?.uid]);

  // Removed global seedAndCleanup that costs 200 read quotas per session.

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User cancelled or closed the popup, don't log an error or show message
        return;
      }
      console.error('Login error:', error);
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

  // Removed client-side periodic cleanup to prevent Firestore free-tier read quota exhaustion

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
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
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
                onClick={() => {
                  setSelectedTipAmount(50);
                  setShowSupportModal(true);
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-yellow-500/40 text-yellow-400 hover:from-amber-500/30 hover:to-yellow-500/30 hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                title="Support & Donate"
              >
                <Heart className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                <span>Support / Donate</span>
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-4 rounded-2xl glass text-cyan-400 hover:bg-cyan-500/10 transition-all"
                title="Share"
              >
                <Share2 className="w-6 h-6" />
              </button>
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
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter font-display text-cyan-400">Auction Pitch</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => {
                  setSelectedTipAmount(50);
                  setShowSupportModal(true);
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center gap-1.5 text-xs font-black"
                title="Support & Donate"
              >
                <Heart className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                <span className="hidden sm:inline">Donate</span>
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-3 rounded-xl glass text-cyan-400"
              >
                <Share2 className="w-5 h-5" />
              </button>
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
              <Leaderboard 
                onBack={() => setCurrentView('play')} 
                currentUser={user}
                currentUserRank={userRank}
              />
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
                            onClick={() => setShowHowToPlay(!showHowToPlay)}
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
                        
                        <AnimatePresence>
                          {showHowToPlay && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full mb-8 overflow-hidden"
                            >
                              <div className="p-8 rounded-3xl bg-white/5 border border-cyan-500/20 text-slate-300 text-sm space-y-6 leading-relaxed text-left">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">Video Tutorial</span>
                                    <span className="text-[10px] font-bold text-slate-400">Watch our quick guide for better understanding</span>
                                  </div>
                                  <a 
                                    href="https://youtube.com/shorts/QCKFZFwpIck?si=pPPDq674_eN4PJex" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    Watch Now
                                  </a>
                                </div>

                                <div>
                                  <h3 className="text-cyan-400 font-black uppercase tracking-widest text-xs mb-4">Quick Rules</h3>
                                  <ol className="space-y-3 list-decimal list-inside font-bold">
                                    <li>Create room or join room from public or private room using your friends code.</li>
                                    <li>You can create a room of 2, 3, 5, 10 and if you're in a hurry you can reduce the bid time to 10 seconds.</li>
                                    <li>If you're playing alone, you can also create a room with bots. It's an IPL auction expert.</li>
                                    <li>Place bids and win to add that particular player to your dream team.</li>
                                    <li>The player with the highest total squad score wins the battle.</li>
                                    <li>You can choose dark theme or white theme in the profile section.</li>
                                    <li>You can also choose your name in the profile section.</li>
                                  </ol>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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

                    {/* Supporter Badge & Donate Card */}
                    <div className="w-full mt-6 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-yellow-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center flex-shrink-0">
                          <Heart className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block">VIP Community Supporter</span>
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">Support Server & Dev Costs</h4>
                          <p className="text-xs text-slate-400">Keep Auction Pitch 100% free and lightning-fast with a small UPI tip!</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedTipAmount(50);
                          setShowSupportModal(true);
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 flex-shrink-0"
                      >
                        <Wallet className="w-4 h-4" />
                        Tip / Donate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentView === 'rooms' ? (
              <div className="bento-item glass-dark">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter font-display">Public Auctions</h2>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <button 
                      onClick={fetchPublicRooms}
                      className="px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {publicRooms.length} Live Rooms
                    </div>
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
                              {(Object.values(r.players) as any[]).slice(0, 3).map((p) => (
                                <img key={p.uid} src={p.photoURL} className="w-8 h-8 rounded-full border-2 border-[#050505]" alt="" />
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
                {/* Resume or Recent Room Card */}
                <AnimatePresence mode="wait">
                  {resumableRoom ? (
                    <motion.div 
                      key="resume"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="md:col-span-12 bento-item bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-cyan-400/30 relative overflow-hidden group mb-4"
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
                  ) : latestPublicRoom ? (
                    <motion.div 
                      key="latest"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="md:col-span-12 bento-item bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/30 relative overflow-hidden group mb-4"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-orange-400 animate-pulse" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-1 block">Recent Public Auction</span>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Join {latestPublicRoom.title || 'Live Room'}</h3>
                            <p className="text-slate-400 font-bold text-xs">Room ID: {latestPublicRoom.roomId} • {Object.keys(latestPublicRoom.players).length}/{latestPublicRoom.playersCount} Players</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleJoinRoomById(latestPublicRoom.roomId)}
                          className="w-full md:w-auto px-10 py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                        >
                          Join Now
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
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
                      className="mb-10 p-6 rounded-2xl bg-white/5 border border-cyan-500/20 text-slate-300 text-xs space-y-6 leading-relaxed"
                    >
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-cyan-400">Watch Tutorial</span>
                          <span className="text-[8px] font-bold text-slate-500">Quick 60s guide</span>
                        </div>
                        <a 
                          href="https://youtube.com/shorts/QCKFZFwpIck?si=pPPDq674_eN4PJex" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Watch Now
                        </a>
                      </div>

                      <div>
                        <h3 className="text-cyan-400 font-black uppercase tracking-widest text-[10px] mb-3">Quick Rules</h3>
                        <ol className="space-y-3 list-decimal list-inside font-bold">
                          <li>Create room or join room from public or private room using your friends code.</li>
                          <li>You can create a room of 2, 3, 5, 10 and if you're in a hurry you can reduce the bid time to 10 seconds.</li>
                          <li>If you're playing alone, you can also create a room with bots. It's an IPL auction expert.</li>
                          <li>Place bids and win to add that particular player to your dream team.</li>
                          <li>The player with the highest total squad score wins the battle.</li>
                          <li>You can choose dark theme or white theme in the profile section.</li>
                          <li>You can also choose your name in the profile section.</li>
                        </ol>
                      </div>
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
                    
                    <div className="relative">
                      <button 
                        id="tour-solo-play"
                        onClick={handlePlaySolo}
                        disabled={isCreating}
                        className="w-full py-6 rounded-[1.5rem] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white font-black text-lg md:text-xl tracking-widest uppercase flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
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

                {/* Support & Server Fuel Banner */}
                <div className="md:col-span-12 bento-item bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-yellow-500/30 relative overflow-hidden group">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 text-left">
                      <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.25em]">Fuel High-Speed Servers</span>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-[9px] font-black text-yellow-300">100% Free App</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">Support Developer (Divye Lalwani)</h3>
                        <p className="text-slate-400 text-xs font-bold max-w-xl">
                          Auction Pitch is completely free with no intrusive ads. Tip a Chai or Coffee via UPI to keep servers fast for 20,000+ cricket fans!
                        </p>
                      </div>
                    </div>

                    {/* Quick Tip Amounts */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-center lg:justify-end">
                      {[
                        { label: '₹20 Chai', amount: 20 },
                        { label: '₹50 Coffee', amount: 50 },
                        { label: '₹100 Fan', amount: 100 },
                        { label: '₹250 Owner', amount: 250 },
                      ].map((item) => (
                        <button
                          key={item.amount}
                          onClick={() => {
                            setSelectedTipAmount(item.amount);
                            setShowSupportModal(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/5 border border-yellow-400/30 hover:border-yellow-400 hover:bg-yellow-400/20 text-yellow-400 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                        >
                          {item.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedTipAmount(50);
                          setShowSupportModal(true);
                        }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2"
                      >
                        <Wallet className="w-4 h-4" />
                        Donate UPI
                      </button>
                    </div>
                  </div>
                </div>

                {/* IPL Auction Knowledge & Guides Hub */}
                <div className="md:col-span-12 bento-item glass-dark text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.25em] block mb-1">Cricket Knowledge & SEO Guides</span>
                      <h3 className="text-2xl font-black uppercase text-white tracking-tight font-display">IPL Auction Strategy & Hub</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">Master the Mega Auction</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveGuide('how-it-works')}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-cyan-400 transition-colors">How IPL Mega Auction Works</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">Complete breakdown of marquee sets, bidding dynamics, RTM cards, and team purse management.</p>
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mt-3 inline-flex items-center gap-1">Read Guide <ChevronRight className="w-3 h-3" /></span>
                    </button>

                    <button
                      onClick={() => setActiveGuide('rules')}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/40 hover:bg-yellow-500/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 mb-3 group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-yellow-400 transition-colors">IPL Auction Rules & Budget Guide</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">Understand the ₹120 Crore salary cap, minimum squad limits (18-25), and overseas player restrictions.</p>
                      <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider mt-3 inline-flex items-center gap-1">Read Rules <ChevronRight className="w-3 h-3" /></span>
                    </button>

                    <button
                      onClick={() => setActiveGuide('friends')}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 hover:bg-purple-500/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-purple-400 transition-colors">Play Auction With Friends</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">How to host private rooms, invite friends with 6-letter room codes, and run mock battles.</p>
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider mt-3 inline-flex items-center gap-1">Host Guide <ChevronRight className="w-3 h-3" /></span>
                    </button>

                    <button
                      onClick={() => setActiveGuide('strategy')}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-green-400/40 hover:bg-green-500/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400 mb-3 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-green-400 transition-colors">Cricket Manager Strategies</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">Pro bidding strategies: star inflation, bankroll preservation, and winning under-the-radar buys.</p>
                      <span className="text-[10px] font-black text-green-400 uppercase tracking-wider mt-3 inline-flex items-center gap-1">Pro Tips <ChevronRight className="w-3 h-3" /></span>
                    </button>

                    <button
                      onClick={() => setActiveGuide('about')}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-400/40 hover:bg-orange-500/5 transition-all text-left group sm:col-span-2 lg:col-span-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400 mb-3 group-hover:scale-110 transition-transform">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1 group-hover:text-orange-400 transition-colors">About the Creator: Divye Lalwani</h4>
                      <p className="text-xs text-slate-400">Created by Divye Lalwani, an independent builder and cricket fan from New Delhi. Built with React & Firebase for cricket fans worldwide.</p>
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider mt-3 inline-flex items-center gap-1">Learn More <ChevronRight className="w-3 h-3" /></span>
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
             <button 
                onClick={() => {
                  setShowSupportModal(true);
                  setShowQR(false);
                }}
                className="px-10 py-5 rounded-[2rem] bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 border-2 border-cyan-500/30 hover:border-cyan-400 transition-all group flex items-center gap-4 shadow-[0_0_50px_rgba(34,211,238,0.1)]"
             >
                <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Beta Support</span>
                  <span className="text-sm font-black text-white uppercase tracking-widest">Feedback & Support</span>
                </div>
                <ChevronRight className="w-5 h-5 text-cyan-400 ml-2" />
             </button>

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
            <RoomLobby 
              room={room} 
              user={user} 
              onLeave={handleLeaveRoom}
              onShowSupport={() => setShowSupportModal(true)}
            />
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
            <ResultsScreen 
              room={room} 
              user={user} 
              allPlayers={IPL_PLAYERS} 
              onHome={() => setRoom(null)}
              onShowSupport={() => setShowSupportModal(true)}
            />
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

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-sm glass-dark p-8 rounded-[2.5rem] border border-cyan-500/20 text-center relative"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/10 text-slate-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-cyan-400" />
              </div>

              <h2 className="text-2xl font-black uppercase italic mb-2">Share Arena</h2>
              <p className="text-slate-400 text-sm mb-8 font-bold">Invite your friends to the ultimate auction!</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => {
                    const text = encodeURIComponent("Check out this amazing IPL Auction Simulator! Build your dream team and compete with friends: https://auctionpitch.vercel.app/");
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-400">WhatsApp</span>
                </button>

                <button 
                  onClick={() => {
                    copyToClipboard();
                    alert('Link copied! Paste it in your Instagram story or bio.');
                  }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Instagram</span>
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                  <div className="flex-1 truncate text-left text-xs font-mono text-slate-400">
                    https://auctionpitch.vercel.app/
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-cyan-500 text-black shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive SEO & Knowledge Guide Reader Modal */}
      <AnimatePresence>
        {activeGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] glass-dark rounded-[2.5rem] border border-cyan-500/30 overflow-hidden flex flex-col shadow-2xl relative my-auto"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-20">
                <button 
                  onClick={() => setActiveGuide(null)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Auction Game
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveGuide(null);
                      setSelectedTipAmount(50);
                      setShowSupportModal(true);
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black uppercase"
                  >
                    <Heart className="w-3.5 h-3.5 fill-yellow-400" />
                    Support
                  </button>
                  <button 
                    onClick={() => setActiveGuide(null)}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Guide Content Scroll Area */}
              <div className="p-6 sm:p-10 overflow-y-auto flex-1">
                {activeGuide === 'how-it-works' && <HowIplMegaAuctionWorks />}
                {activeGuide === 'rules' && <IplAuctionRulesGuide />}
                {activeGuide === 'friends' && <IplAuctionGameFriends />}
                {activeGuide === 'strategy' && <CricketManagerGameOnline />}
                {activeGuide === 'about' && <AboutCreator />}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-bold">Ready to build your dream IPL squad?</span>
                <button
                  onClick={() => setActiveGuide(null)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Playing Auction Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support & Donation Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="w-full max-w-lg glass-dark p-6 sm:p-10 rounded-[3rem] border border-yellow-500/30 relative overflow-hidden shadow-2xl my-auto"
            >
              <button 
                onClick={() => {
                  setShowSupportModal(false);
                  setShowQR(false);
                }}
                className="absolute top-6 right-6 p-3 rounded-full bg-black/80 hover:bg-black transition-all text-white border border-white/20 z-[10] shadow-2xl"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30">
                  <Heart className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">Support The Creator</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-2 italic font-display leading-tight">
                  SUPPORT <br />
                  <span className="text-yellow-400">AUCTION PITCH</span>
                </h2>

                <p className="text-slate-400 font-bold text-xs sm:text-sm mb-6 leading-relaxed">
                  Auction Pitch is built by <strong className="text-white">Divye Lalwani</strong> as a free simulator for cricket lovers. Donations keep our Firestore database & servers fast for 20,000+ players!
                </p>

                {/* Amount Selector */}
                <div className="mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-left">Choose Tip Amount</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { label: '₹20', desc: 'Chai ☕', amount: 20 },
                      { label: '₹50', desc: 'Coffee ☕', amount: 50 },
                      { label: '₹100', desc: 'Pro 🏏', amount: 100 },
                      { label: '₹250', desc: 'Owner 🏆', amount: 250 },
                      { label: '₹500', desc: 'VIP 👑', amount: 500 },
                    ].map((item) => (
                      <button
                        key={item.amount}
                        onClick={() => setSelectedTipAmount(item.amount)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          selectedTipAmount === item.amount 
                            ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-yellow-400/50 hover:bg-yellow-400/10'
                        }`}
                      >
                        <span className="block text-sm font-black">{item.label}</span>
                        <span className="block text-[9px] uppercase tracking-wider opacity-80">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Action Box */}
                <div className="p-6 rounded-[2rem] bg-yellow-400/5 border border-yellow-400/20 relative overflow-hidden mb-6">
                  {/* Tap to Pay via UPI apps */}
                  <a 
                    href={`upi://pay?pa=divye64@oksbi&pn=Divye%20Lalwani&am=${selectedTipAmount}&cu=INR&tn=AuctionPitch%20Support`}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black uppercase tracking-widest text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 mb-4"
                  >
                    <Wallet className="w-5 h-5" />
                    Pay ₹{selectedTipAmount} via UPI (GPay / PhonePe / Paytm)
                  </a>

                  {/* Copy UPI ID */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                    <div className="flex flex-col text-left pl-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">UPI ID</span>
                      <span className="text-sm font-mono font-black text-yellow-400">divye64@oksbi</span>
                    </div>
                    <button
                      onClick={copyUpiId}
                      className="px-4 py-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* QR Code Toggle / Display */}
                  {!showQR ? (
                    <button 
                      onClick={() => setShowQR(true)}
                      className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 text-yellow-400" />
                      Show QR Code for ₹{selectedTipAmount}
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 pt-2"
                    >
                      <div className="p-4 bg-white rounded-2xl shadow-2xl relative">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=divye64@oksbi%26pn=Divye%20Lalwani%26am=${selectedTipAmount}%26cu=INR%26tn=AuctionPitch%20Support`} 
                          alt="Support QR Code"
                          className="w-44 h-44 sm:w-48 sm:h-48"
                        />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Scan with GPay, PhonePe, Paytm, or any banking app
                      </p>
                      <button 
                        onClick={() => setShowQR(false)}
                        className="text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Hide QR Code
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Feedback & Community */}
                <div className="flex items-center justify-center gap-4 pt-2 text-xs">
                  <a 
                    href="mailto:divye0005@gmail.com?subject=Auction Pitch Feedback / Donation"
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-bold"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    divye0005@gmail.com
                  </a>
                  <span className="text-slate-600">•</span>
                  <a 
                    href="https://t.me/auctionpitch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-bold"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    Telegram Community
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
