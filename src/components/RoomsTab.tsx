import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Play, Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { Room, UserProfile } from '../types';

interface RoomsTabProps {
  user: UserProfile;
  publicRooms: Room[];
  fetchPublicRooms: () => void;
  handleDeleteRoom: (id: string) => void;
  handleJoinRoomById: (id: string) => void;
  handleCreateRoom: () => void;
  handlePlaySolo: () => void;
  isCreating: boolean;
  createOptions: any;
  setCreateOptions: (opt: any) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  handleJoinRoom: () => void;
  isAdmin: boolean;
}

export default function RoomsTab({
  user, publicRooms, fetchPublicRooms, handleDeleteRoom, handleJoinRoomById,
  handleCreateRoom, handlePlaySolo, isCreating, createOptions, setCreateOptions,
  joinCode, setJoinCode, handleJoinRoom, isAdmin
}: RoomsTabProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'public' | 'create'>('public');

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto pb-32 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase text-white">Custom Lobbies</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveSubTab('public')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeSubTab === 'public' ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500'}`}
        >
          Public Rooms
        </button>
        <button 
          onClick={() => setActiveSubTab('create')}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeSubTab === 'create' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-500'}`}
        >
          Create Room
        </button>
      </div>

      {activeSubTab === 'public' && (
        <div className="bento-item glass-dark">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-tighter font-display">Live Public Auctions</h2>
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <button 
                onClick={fetchPublicRooms}
                className="px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
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
                <p className="text-xs font-black uppercase tracking-widest">No public rooms available.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-item glass-dark flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter font-display">Host</h2>
              </div>
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
              </div>
            </div>
          </div>
          
          <div className="bento-item glass-dark flex flex-col justify-between">
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
  );
}
