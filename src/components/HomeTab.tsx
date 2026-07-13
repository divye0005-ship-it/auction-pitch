import React from 'react';
import { motion } from 'motion/react';
import { Users, Play, Clock, Car, Home as HomeIcon, Zap, Trophy } from 'lucide-react';
import { UserProfile } from '../types';

interface HomeTabProps {
  user: UserProfile;
  setRoom: (room: any) => void;
  setCurrentView: (view: any) => void;
  handleCreateRoom: (category: string) => void;
  handlePlaySolo: (category: string) => void;
  handleJoinMatchmaking: (category: string) => void;
}

export default function HomeTab({ user, handlePlaySolo, handleJoinMatchmaking, setCurrentView }: HomeTabProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 hide-scrollbar">
      <div className="p-4 pt-8 pb-6 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-20 flex justify-between items-center border-b border-white/5">
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase text-white">Lobby</h1>
      </div>

      <div className="space-y-4 px-4">
        {/* IPL Auction Card */}
        <div 
          onClick={() => handleJoinMatchmaking('ipl')}
          className="bento-item bg-gradient-to-br from-blue-900/40 to-orange-900/40 border border-blue-500/30 hover:border-orange-500/60 cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="m16 8-4-4-10 10 4 4 10-10Z" /><path d="M12 12 8 8" /><circle cx="18" cy="18" r="2" fill="currentColor" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-1 drop-shadow-md">IPL Auction</h3>
              <p className="text-xs text-blue-200 font-bold">Build your dream T20 squad.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-all">
              <Play className="w-4 h-4 fill-current text-white group-hover:text-black" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-4 relative z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePlaySolo('ipl'); }}
              className="text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-orange-400 transition-all"
            >
              Play Solo (vs AI)
            </button>
          </div>
        </div>

        {/* Car Auction Card */}
        <div 
          onClick={() => handleJoinMatchmaking('car')}
          className="bento-item bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/30 hover:border-cyan-500/60 cursor-pointer transition-all group relative overflow-hidden mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2" fill="currentColor"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2" fill="currentColor"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-1 drop-shadow-md">Car Auction</h3>
              <p className="text-xs text-purple-200 font-bold">Bid on exotic hypercars.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-black transition-all">
              <Play className="w-4 h-4 fill-current text-white group-hover:text-black" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-4 relative z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePlaySolo('car'); }}
              className="text-[10px] font-black uppercase tracking-widest text-purple-300 hover:text-cyan-400 transition-all"
            >
              Play Solo (vs AI)
            </button>
          </div>
        </div>

        
        {/* Create Custom Room Card */}
        <div 
          onClick={() => setCurrentView('rooms')}
          className="bento-item bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 hover:border-emerald-500/60 cursor-pointer transition-all group relative overflow-hidden mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-1 drop-shadow-md">Custom Rooms</h3>
              <p className="text-xs text-green-200 font-bold">Play with friends privately.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-black transition-all">
              <Play className="w-4 h-4 fill-current text-white group-hover:text-black" />
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
