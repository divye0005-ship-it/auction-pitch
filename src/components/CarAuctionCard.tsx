import React from 'react';
import LuxuryImage from './LuxuryImage';
import { motion } from 'motion/react';
import { Zap, Target, TrendingUp } from 'lucide-react';
import { Player } from '../types';

interface CarAuctionCardProps {
  player: Player | null; // using Player type but containing car data
}

const CarAuctionCard: React.FC<CarAuctionCardProps> = ({ player }) => {
  if (!player) return null;

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden rounded-[2.5rem]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.5)_20px,rgba(255,255,255,0.5)_40px)]"></div>
      </div>
      <motion.div
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 12 }}
        // Glowing neon yellow border
        className="w-full aspect-[3/4] rounded-[2.5rem] p-1 bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_40px_rgba(255,255,0,0.5)] border-yellow-500/50"
      >
        <div className="w-full h-full rounded-[2.3rem] bg-[#050505] overflow-hidden relative flex flex-col">
          {/* Main Visual Header */}
          <div className="h-1/2 relative overflow-hidden">
            <img 
              src={player.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=512`} 
              className="w-full h-full object-cover object-center"
              alt={player.name}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            
            {/* Score Badge */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl glass-dark border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase">Score</span>
              <span className="text-sm md:text-xl font-black font-mono">{player.auctionScore || 0}</span>
            </div>
          </div>

          {/* Car Info */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2 font-display">{player.name}</h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                  {player.role || 'Supercar'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  {player.country || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">HP</span>
                </div>
                <span className="text-lg font-black font-mono">{player.stats?.hp || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Target className="w-3 h-3 text-red-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Top Speed</span>
                </div>
                <span className="text-lg font-black font-mono">{player.stats?.topSpeed ? `${player.stats.topSpeed} km/h` : '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Value</span>
                </div>
                <span className="text-lg font-black font-mono text-green-400">{player.stats?.value || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CarAuctionCard;
