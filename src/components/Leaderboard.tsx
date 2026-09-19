import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { dbService } from '../services/dbService';
import { Trophy, Medal, Award, ArrowLeft, RefreshCw, Sparkles, UserCheck } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
  currentUser?: UserProfile | null;
  currentUserRank?: number | null;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentUser, currentUserRank }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLeaderboardData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      const data = await dbService.getLeaderboard(force);
      setUsers(data);
      setLastRefreshedAt(Date.now());
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData(false);
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const handleManualRefresh = () => {
    if (cooldownSeconds > 0 || refreshing) return;
    fetchLeaderboardData(true);
    setCooldownSeconds(30);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isCurrentUserInTop20 = currentUser && users.some(u => u.uid === currentUser.uid);

  return (
    <div id="top-20-leaderboard" className="flex-1 p-4 md:p-12 max-w-4xl mx-auto w-full pb-32 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-10 gap-4">
        <button 
          id="leaderboard-back-btn"
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl glass hover:bg-white/10 transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Play</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Top 20 All-Time Champions
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter font-display flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
            Hall of Fame
          </h1>
        </div>

        <button 
          id="leaderboard-refresh-btn"
          onClick={handleManualRefresh}
          disabled={cooldownSeconds > 0 || refreshing}
          className={`w-full sm:w-auto px-4 py-3 rounded-2xl glass transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider ${
            cooldownSeconds > 0 ? 'opacity-50 text-slate-500 cursor-not-allowed' : 'hover:bg-white/10 text-cyan-400 hover:text-cyan-300'
          }`}
          title={cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s before next refresh to save quota` : 'Refresh Leaderboard'}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{cooldownSeconds > 0 ? `${cooldownSeconds}s` : 'Refresh'}</span>
        </button>
      </div>

      {/* Current User Standings Banner if not in Top 20 */}
      {currentUser && !isCurrentUserInTop20 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-transparent border border-purple-500/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`} 
              alt="" 
              className="w-10 h-10 rounded-xl border border-purple-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{currentUser.displayName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-black uppercase">You</span>
              </div>
              <span className="text-xs text-slate-400">Keep winning auctions to enter the Top 20!</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Your Rank</span>
            <span className="text-xl font-black font-display text-purple-400">#{currentUserRank || '--'}</span>
          </div>
        </motion.div>
      )}

      {/* Top 20 List */}
      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Loading Top 20 Rankings...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 glass rounded-[2.5rem] border-dashed border-white/10">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">No rankings yet. Start winning auctions!</p>
            <p className="text-xs text-slate-500 mt-1">Be the first to secure a spot in the Top 20 Hall of Fame.</p>
          </div>
        ) : (
          users.slice(0, 20).map((user, index) => {
            const isCurrentUser = currentUser?.uid === user.uid;
            return (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.4) }}
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-[1.75rem] glass transition-all hover:scale-[1.01] ${
                  isCurrentUser ? 'ring-2 ring-cyan-400 bg-cyan-950/20' : ''
                } ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-500/15 via-yellow-500/5 to-transparent border-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.1)]' :
                  index === 1 ? 'bg-gradient-to-r from-slate-300/15 via-slate-300/5 to-transparent border-slate-300/40' :
                  index === 2 ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent border-orange-500/40' :
                  'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-display">
                    {index === 0 ? <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" /> :
                     index === 1 ? <Medal className="w-6 h-6 md:w-8 md:h-8 text-slate-300" /> :
                     index === 2 ? <Award className="w-6 h-6 md:w-8 md:h-8 text-amber-500" /> :
                     <span className="text-base md:text-xl font-black text-slate-500">#{index + 1}</span>}
                  </div>
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border-2 border-white/10 bg-slate-900 object-cover" 
                    alt="" 
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-lg font-black uppercase tracking-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-none text-white">
                        {user.displayName || 'Player'}
                      </span>
                      {isCurrentUser && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-black uppercase tracking-wider border border-cyan-500/30">
                          <UserCheck className="w-3 h-3" /> You
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {index === 0 ? '👑 Reigning IPL Champion' : index < 3 ? 'Elite Grandmaster' : 'Auction Veteran'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-0.5">Winnings</span>
                  <span className="text-lg md:text-2xl font-black font-display text-white">
                    ₹{(user.totalWinnings || 0).toLocaleString('en-IN')} L
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Quota-Friendly Live Indicator */}
      <div className="mt-8 text-center text-[11px] text-slate-500 font-medium">
        ⚡ Leaderboard updates cached every 3 minutes to keep gameplay ultra-fast & seamless.
      </div>
    </div>
  );
};

export default Leaderboard;
