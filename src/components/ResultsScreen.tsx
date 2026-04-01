import React from 'react';
import { motion } from 'motion/react';
import { Room, Player, UserProfile } from '../types';
import { Trophy, Home, Share2, Wallet, Users, Star, TrendingUp } from 'lucide-react';

interface ResultsScreenProps {
  room: Room;
  user: UserProfile;
  allPlayers: Player[];
  onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ room, user, allPlayers, onHome }) => {
  const getPlayerSquad = (uid: string) => {
    const playerIds = room.squads[uid] || [];
    return allPlayers.filter(p => playerIds.includes(p.playerId));
  };

  const calculateSquadScore = (uid: string) => {
    const squad = getPlayerSquad(uid);
    return squad.reduce((sum, p) => sum + p.auctionScore, 0);
  };

  const leaderboard = (Object.values(room.players) as any[])
    .map(p => ({
      ...p,
      totalScore: calculateSquadScore(p.uid),
      spent: 10000 - (room.purses[p.uid] || 10000),
      squadCount: (room.squads[p.uid] || []).length
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const myStats = leaderboard.find(p => p.uid === user.uid);

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Header Section */}
        <div className="md:col-span-12 flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Auction Concluded</span>
            <h2 className="text-6xl font-black font-display tracking-tighter uppercase">Final Standings</h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => alert("Results shared!")}
              className="px-8 py-4 rounded-2xl glass text-cyan-400 hover:bg-cyan-400/10 transition-all font-black uppercase text-xs tracking-widest flex items-center gap-3"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button 
              onClick={onHome}
              className="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="md:col-span-8 bento-item glass-dark">
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 font-display">Leaderboard</h3>
          <div className="space-y-4">
            {leaderboard.map((p, idx) => (
              <motion.div 
                key={p.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border flex items-center justify-between group transition-all ${p.uid === user.uid ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-4">
                    <img src={p.photoURL} className="w-12 h-12 rounded-xl" alt="" />
                    <div className="flex flex-col">
                      <span className="text-lg font-black uppercase tracking-tight">{p.displayName}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.squadCount} Players Acquired</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-12">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spent</span>
                    <span className="text-sm font-black font-mono">₹{(p.spent / 100).toFixed(2)} Cr</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Squad Score</span>
                    <span className="text-2xl font-black font-mono text-cyan-400">{p.totalScore}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Squad Summary */}
        <div className="md:col-span-4 space-y-6">
          <div className="bento-item glass-dark bg-gradient-to-br from-cyan-500/10 to-purple-600/10">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 font-display">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Rank</span>
                <span className="text-2xl font-black font-display">#{leaderboard.findIndex(p => p.uid === user.uid) + 1}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Squad Size</span>
                <span className="text-2xl font-black font-display">{myStats?.squadCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total Spent</span>
                <span className="text-xl font-black font-mono">₹{(myStats?.spent || 0) / 100} Cr</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Efficiency</span>
                <span className="text-xl font-black font-mono">{myStats ? (myStats.totalScore / (myStats.spent || 1)).toFixed(2) : 0}</span>
              </div>
            </div>
          </div>

          <div className="bento-item glass-dark max-h-[400px] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 font-display">Your Squad</h3>
            <div className="space-y-3">
              {getPlayerSquad(user.uid).map(p => (
                <div key={p.playerId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight">{p.name}</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{p.role}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono text-cyan-400">{p.auctionScore}</span>
                </div>
              ))}
              {getPlayerSquad(user.uid).length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  No players acquired
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsScreen;
