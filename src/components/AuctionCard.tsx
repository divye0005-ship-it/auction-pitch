import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Zap, Target, TrendingUp, Trophy } from 'lucide-react';
import { Player } from '../types';

interface AuctionCardProps {
  player: Player | null;
  isRevealed: boolean;
  onReveal?: () => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ player, isRevealed }) => {
  if (!player) return null;

  const getGlowClass = (score: number) => {
    if (score >= 900) return 'shadow-[0_0_40px_rgba(255,215,0,0.3)] border-yellow-500/50';
    if (score >= 750) return 'shadow-[0_0_30px_rgba(192,192,192,0.3)] border-slate-400/50';
    if (score >= 500) return 'shadow-[0_0_20px_rgba(205,127,50,0.3)] border-orange-600/50';
    return 'border-white/10';
  };

  const getTierColor = (score: number) => {
    if (score >= 900) return 'from-yellow-400 to-yellow-600';
    if (score >= 750) return 'from-slate-300 to-slate-500';
    if (score >= 500) return 'from-orange-400 to-orange-700';
    return 'from-slate-700 to-slate-900';
  };

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <motion.div
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 12 }}
        className={`w-full aspect-[3/4] rounded-[2.5rem] p-1 bg-gradient-to-br ${getTierColor(player.auctionScore)} ${getGlowClass(player.auctionScore)}`}
      >
        <div className="w-full h-full rounded-[2.3rem] bg-[#050505] overflow-hidden relative flex flex-col">
          {/* Player Image Header */}
          <div className="h-1/2 relative overflow-hidden">
            <img 
              src={player.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=512`} 
              className="w-full h-full object-cover"
              alt={player.name}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            
            {/* Team Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 rounded-full glass-dark border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">{player.team}</span>
            </div>

            {/* Score Badge */}
            <div className="absolute top-6 right-6 w-14 h-14 rounded-2xl glass-dark border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-slate-500 uppercase">Score</span>
              <span className="text-xl font-black font-mono">{player.auctionScore}</span>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 font-display">{player.name}</h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                  {player.role}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  {player.country}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Zap className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Power</span>
                </div>
                <span className="text-lg font-black font-mono">{player.stats.sr || player.stats.economy || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Target className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Impact</span>
                </div>
                <span className="text-lg font-black font-mono">{player.stats.avg || player.stats.bowlAvg || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Value</span>
                </div>
                <span className="text-lg font-black font-mono">₹{player.basePrice}L</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuctionCard;
