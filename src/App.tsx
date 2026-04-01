import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { dbService } from './services/dbService';
import { IPL_PLAYERS } from './services/playerData';
import { UserProfile, Room, Player } from './types';
import RoomLobby from './components/RoomLobby';
import AuctionGameplay from './components/AuctionGameplay';
import ResultsScreen from './components/ResultsScreen';
import ChatPanel from './components/ChatPanel';
import Leaderboard from './components/Leaderboard';
import { Trophy, Plus, Users, LogIn, LogOut, Sun, Moon, Mail, ChevronRight, Play, LayoutDashboard, User as UserIcon, ArrowLeft, Award, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createOptions, setCreateOptions] = useState({ players: 5, timer: 15, isPublic: true });
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
              displayName: firebaseUser.displayName || 'Player',
              photoURL: firebaseUser.photoURL || undefined,
              email: firebaseUser.email || '',
              role: 'user',
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
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError('This domain is not authorized in Firebase. Please add your Vercel domain to the "Authorized Domains" list in the Firebase Console.');
      } else {
        setLoginError('Login failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRoom(null);
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user || isCreating) return;
    setIsCreating(true);
    try {
      const roomId = generateRoomId();
      const newRoom: Room = {
        roomId,
        hostId: user.uid,
        playersCount: createOptions.players,
        revealTimer: createOptions.timer,
        isPublic: createOptions.isPublic,
        status: 'waiting',
        players: { [user.uid]: { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } },
        squads: { [user.uid]: [] },
        purses: { [user.uid]: 10000 }, // ₹100 Crores = 10000 Lakhs
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

  const handleJoinRoomById = async (id: string) => {
    if (!user) return;
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

  const handleTerminateAuction = async () => {
    if (!room || !user || room.hostId !== user.uid) return;
    if (window.confirm("Are you sure you want to terminate this auction? This will end it for everyone.")) {
      await dbService.terminateRoom(room.roomId);
    }
  };

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
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-6 right-6 z-50 p-4 rounded-2xl glass-dark text-cyan-400 hover:scale-110 transition-all"
      >
        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {!user ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl relative z-10"
          >
            <div className="flex flex-col items-center">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-[2.5rem] flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(0,242,255,0.3)]"
              >
                <Trophy className="w-16 h-16 text-white" />
              </motion.div>
              
              <h1 className="text-[15vw] md:text-[120px] font-black leading-[0.85] uppercase tracking-tighter text-center mb-8 font-display">
                IPL 2026<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                  AUCTION PRO
                </span>
              </h1>
              
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-16 text-center max-w-lg">
                The Ultimate Real-Time Multiplayer Experience for the Next Generation of Fans
              </p>
              
              {loginError && (
                <div className="max-w-md w-full p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center space-y-2 mb-8">
                  <p>{loginError}</p>
                  {loginError.includes('Authorized Domains') && (
                    <p className="text-xs opacity-70">Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains and add your current URL.</p>
                  )}
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="group relative px-12 py-6 rounded-[2rem] bg-white text-black font-black text-lg tracking-widest uppercase flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 group-hover:text-white transition-colors">Sign in with Google</span>
                <LogIn className="w-6 h-6 relative z-10 group-hover:text-white transition-colors" />
              </motion.button>
              
              <div className="mt-24 flex flex-col items-center gap-6">
                <a 
                  href="mailto:divye0005@gmail.com?subject=IPL Auction Donation"
                  className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-cyan-400 transition-all flex items-center gap-3 group"
                >
                  <Mail className="w-4 h-4 group-hover:animate-bounce" />
                  Support the developer
                </a>
              </div>
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
            <h1 className="text-3xl font-black uppercase tracking-tighter font-display text-cyan-400">IPL AUCTION</h1>
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

                  <div className="flex flex-col items-center text-center pt-12 pb-8">
                    <div className="relative mb-8">
                      <img src={user.photoURL} className="w-32 h-32 rounded-[2.5rem] border-4 border-cyan-500/30 p-2" alt="" />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-cyan-400 to-purple-600 p-3 rounded-2xl shadow-xl">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-4xl font-black uppercase tracking-tighter font-display mb-2">{user.displayName}</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mb-8">{user.email}</p>

                    <button 
                      onClick={testVoice}
                      className="mb-12 px-6 py-3 rounded-xl glass hover:bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Test Voice Quality
                    </button>

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
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Room ID</span>
                            <span className="text-xl font-black font-display text-cyan-400">{r.roomId}</span>
                          </div>
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
                {/* Create Room Card */}
                <div className="md:col-span-7 bento-item glass-dark relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full -mr-32 -mt-32 group-hover:bg-cyan-500/10 transition-all duration-700"></div>
                  
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 font-display">Create Room</h2>
                  
                  <div className="space-y-10 mb-12">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4">Max Players</span>
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
                      <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4">Bid Timer</span>
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
                      <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4">Room Visibility</span>
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

                  <button 
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="w-full py-6 rounded-[1.5rem] bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black text-lg tracking-widest uppercase flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                    {isCreating ? 'Launching...' : 'Launch Auction'}
                  </button>
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

          <div className="mt-20 text-center pb-12">
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
              allPlayers={IPL_PLAYERS} 
              isMuted={isMuted}
              onQuit={() => setRoom(null)} 
              onTerminate={room.hostId === user.uid ? handleTerminateAuction : undefined}
            />
          ) : (
            <ResultsScreen room={room} user={user} allPlayers={IPL_PLAYERS} onHome={() => setRoom(null)} />
          )}
          
          {room.status !== 'finished' && (
            <ChatPanel roomId={room.roomId} userId={user.uid} userName={user.displayName} />
          )}
        </div>
      )}
    </div>
  );
}
