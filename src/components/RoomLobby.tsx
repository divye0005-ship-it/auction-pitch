import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, UserProfile } from '../types';
import { dbService } from '../services/dbService';
import { User, LogOut, Play, Plus, Bot, ShieldCheck, Clock, Users, Copy, Check, Send } from 'lucide-react';

interface RoomLobbyProps {
  room: Room;
  user: UserProfile;
  onLeave: () => void;
  onShowSupport?: () => void;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ room, user, onLeave, onShowSupport }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isHost = room.hostId === user.uid;
  const playersArr = Object.values(room.players) as any[];
  const currentUserInRoom = room.players[user.uid];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const startAuction = async () => {
    if (playersArr.length < 2) {
      alert("Need at least 2 players!");
      return;
    }
    await dbService.updateRoom(room.roomId, { status: 'active' });
  };

  const addBot = async () => {
    if (playersArr.length >= room.playersCount) return;
    
    const botId = `bot_${Math.random().toString(36).substring(2, 7)}`;
    const botNames = ["AuctionMaster", "BidBot", "CricketPro", "StatNerd", "GamerX"];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)];
    
    const newBot = {
      uid: botId,
      displayName: `${randomName} (BOT)`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${botId}`,
      isBot: true
    };

    await dbService.updateRoom(room.roomId, {
      [`players.${botId}`]: newBot,
      [`squads.${botId}`]: [],
      [`purses.${botId}`]: 10000
    });
  };

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Room Info Header */}
        <div className="md:col-span-12 bento-item glass-dark flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{room.title || 'Room Code'}</span>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black font-display tracking-widest text-cyan-400">{room.roomId}</div>
                <button 
                  onClick={handleCopyCode}
                  className="p-3 rounded-xl glass text-slate-400 hover:text-white transition-all"
                >
                  {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="h-12 w-px bg-white/10 hidden md:block"></div>
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Players</span>
                <div className="flex items-center gap-2 font-black">
                  <Users className="w-4 h-4 text-purple-400" />
                  {playersArr.length}/{room.playersCount}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Timer</span>
                <div className="flex items-center gap-2 font-black">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  {room.revealTimer}s
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onLeave}
              className="flex-1 md:flex-none px-8 py-4 rounded-2xl glass text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all font-black uppercase text-xs tracking-widest"
            >
              Quit
            </button>
            {isHost && (
              <button 
                onClick={startAuction}
                className="flex-1 md:flex-none px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Game
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="md:col-span-8 bento-item glass-dark">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter font-display">Squad Members</h3>
            {isHost && playersArr.length < room.playersCount && (
              <button 
                onClick={addBot}
                className="px-4 py-2 rounded-xl glass text-cyan-400 hover:bg-cyan-400/10 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Add Bot
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {playersArr.map((p, idx) => (
                <motion.div 
                  key={p.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-2xl border flex items-center justify-between bg-white/5 border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={p.photoURL} className="w-12 h-12 rounded-xl" alt="" />
                      {p.uid === room.hostId && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black p-1 rounded-lg">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-tight">{p.displayName}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {p.uid === room.hostId ? 'Host' : 'Chilling...'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, room.playersCount - playersArr.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="p-4 rounded-2xl border border-dashed border-white/10 flex items-center gap-4 opacity-30">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules/Tips Card */}
        <div className="md:col-span-4 bento-item glass-dark bg-gradient-to-br from-purple-600/10 to-pink-600/10">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6 font-display">Auction Rules</h3>
          <ul className="space-y-4">
            {[
              "₹100 Crore starting purse",
              "Base price starts at ₹25 Lakhs",
              "Minimum squad: 11 players",
              "Real-time bidding with bots",
              "Highest bidder wins the player"
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-400">
                <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] text-cyan-400">
                  {i + 1}
                </div>
                {rule}
              </li>
            ))}
          </ul>
          
          <div className="mt-12 p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2">Pro Tip</span>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
              Don't blow your entire purse on one superstar. Balance is key to winning the league!
            </p>
          </div>
        </div>

        {onShowSupport && (
          <div className="md:col-span-12 flex justify-center mt-4">
            <button 
              onClick={onShowSupport}
              className="group flex items-center gap-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 px-8 py-4 rounded-2xl border border-cyan-500/30 transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">Beta Phase</span>
                <span className="text-xs font-black text-white uppercase tracking-tight">Need Support or Feedback?</span>
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RoomLobby;
