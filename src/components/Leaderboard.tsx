import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { dbService } from '../services/dbService';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await dbService.getLeaderboard();
      setUsers(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-12 max-w-4xl mx-auto w-full pb-32 md:pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
        <button 
          onClick={onBack}
          className="w-full sm:w-auto p-4 rounded-2xl glass hover:bg-white/10 transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter font-display flex items-center gap-4">
          <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
          Leaderboard
        </h1>
        <div className="hidden sm:block w-20"></div> {/* Spacer */}
      </div>

      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Loading Rankings...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 glass rounded-[2.5rem] border-dashed border-white/10">
            <p className="text-slate-500 font-black uppercase tracking-widest">No rankings yet. Start winning auctions!</p>
          </div>
        ) : (
          users.map((user, index) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] glass transition-all hover:scale-[1.02] ${
                index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30' :
                index === 1 ? 'bg-gradient-to-r from-slate-300/10 to-transparent border-slate-300/30' :
                index === 2 ? 'bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/30' :
                'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
                  {index === 0 ? <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" /> :
                   index === 1 ? <Medal className="w-6 h-6 md:w-8 md:h-8 text-slate-300" /> :
                   index === 2 ? <Award className="w-6 h-6 md:w-8 md:h-8 text-orange-500" /> :
                   <span className="text-lg md:text-2xl font-black text-slate-600">#{index + 1}</span>}
                </div>
                <img src={user.photoURL} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-white/10" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm md:text-xl font-black uppercase tracking-tight truncate max-w-[100px] md:max-w-none">{user.displayName}</span>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Champion</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Winnings</span>
                <span className="text-xl md:text-3xl font-black font-display text-white">{user.totalWinnings || 0}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
