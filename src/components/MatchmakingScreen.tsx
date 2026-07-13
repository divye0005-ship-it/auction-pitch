import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Loader2, Play, ArrowLeft } from 'lucide-react';
import { UserProfile, Room } from '../types';
import { dbService } from '../services/dbService';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface MatchmakingScreenProps {
  user: UserProfile;
  category: string;
  onBack: () => void;
  onJoinRoom: (roomId: string) => void;
  onPlaySolo: (category: string) => void;
}

export default function MatchmakingScreen({ user, category, onBack, onJoinRoom, onPlaySolo }: MatchmakingScreenProps) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [status, setStatus] = useState<'searching' | 'waiting' | 'ready'>('searching');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Presence logic
  useEffect(() => {
    // Update presence
    const updatePresence = async () => {
      try {
        await dbService.updatePresence(user.uid, category);
      } catch (err) {
        console.error("Presence error", err);
      }
    };
    updatePresence();
    const interval = setInterval(updatePresence, 20000); // Update every 20s

    // Listen to online users in this category
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const q = query(
      collection(db, 'presence'), 
      where('mode', '==', category),
      where('lastSeen', '>=', Timestamp.fromDate(thirtySecondsAgo))
    );
    const unsubPresence = onSnapshot(q, (snapshot) => {
      setOnlineCount(snapshot.docs.length);
    });

    return () => {
      clearInterval(interval);
      unsubPresence();
      // Remove presence on unmount
      dbService.removePresence(user.uid).catch(console.error);
    };
  }, [user, category]);

  // Matchmaking logic
  useEffect(() => {
    let unsubRoom: (() => void) | undefined;
    let timer: NodeJS.Timeout;

    const findOrCreateRoom = async () => {
      try {
        setStatus('searching');
        const roomId = await dbService.findAvailableRoom(category);
        if (roomId) {
          await dbService.joinRoom(roomId, user);
          setCurrentRoomId(roomId);
        } else {
          const newRoomId = await dbService.createMatchmakingRoom(category, user);
          setCurrentRoomId(newRoomId);
        }
      } catch (error) {
        console.error('Matchmaking error:', error);
        // Fallback to solo
        onPlaySolo(category);
      }
    };

    findOrCreateRoom();

    return () => {
      if (unsubRoom) unsubRoom();
    };
  }, []);

  // Listen to the room we joined/created
  useEffect(() => {
    if (!currentRoomId) return;
    
    setStatus('waiting');
    
    // Start countdown when waiting begins
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const unsubRoom = dbService.subscribeToRoom(currentRoomId, async (room) => {
      if (!room) return;
      
      const humanPlayers = Object.values(room.players).filter((p: any) => !p.isBot).length;
      if (humanPlayers >= 2) {
        // Room is full, start!
        setStatus('ready');
        clearInterval(timer);
        
        // If we are host, make it active
        if (room.hostId === user.uid && room.status === 'waiting') {
          await dbService.startMatchmakingRoom(currentRoomId);
        }
        
        // Let App.tsx know we are ready
        setTimeout(() => {
          onJoinRoom(currentRoomId);
        }, 1000);
      } else if (room.status === 'active') {
        // Host started it
        clearInterval(timer);
        onJoinRoom(currentRoomId);
      }
    });

    return () => {
      clearInterval(timer);
      unsubRoom();
      // If we leave before active, and we are host, cleanup is ideal, but let's just leave room
      if (status !== 'ready') {
        dbService.leaveRoom(currentRoomId, user.uid).catch(console.error);
      }
    };
  }, [currentRoomId]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bento-item glass-dark flex flex-col items-center text-center p-8 relative overflow-hidden"
      >
        {category === 'ipl' && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-orange-500/10 opacity-50"></div>}
        {category === 'car' && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-50"></div>}
        
        <div className="relative z-10 w-full">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            {status === 'ready' ? (
              <Play className="w-10 h-10 text-green-400" />
            ) : (
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            )}
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">
            {status === 'searching' && 'Finding Match...'}
            {status === 'waiting' && 'Waiting for Players...'}
            {status === 'ready' && 'Match Found!'}
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-widest text-green-400">
              {onlineCount} Online in {category.toUpperCase()}
            </span>
          </div>
          
          {status === 'waiting' && timeLeft > 0 && (
            <div className="mb-6">
              <span className="text-4xl font-mono font-black text-white">{timeLeft}s</span>
            </div>
          )}
          
          {status === 'waiting' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              {timeLeft === 0 ? <p className="text-sm text-orange-400 mb-4 font-bold">No opponent found in time. You can keep waiting or play against AI.</p> : <p className="text-sm text-slate-400 mb-4">You can play against AI immediately.</p>}
              <button 
                onClick={() => onPlaySolo(category)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Play Solo (vs AI)
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
