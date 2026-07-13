import React from 'react';
import { UserProfile } from '../types';
import { LogOut, Sun, Moon, Volume2, VolumeX, Shield, Mail, Heart, ExternalLink } from 'lucide-react';

interface ProfileTabProps {
  user: UserProfile;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  onLogout: () => void;
}

export default function ProfileTab({ user, isDarkMode, setIsDarkMode, isMuted, setIsMuted, onLogout }: ProfileTabProps) {
  const handleSupportUs = () => {
    // UPI Deep Link
    window.location.href = "upi://pay?pa=divye64@oksbi";
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto pb-32 px-4 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase text-white">Profile</h1>
      </div>

      <div className="bento-item glass-dark flex items-center gap-4">
        <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-cyan-500/50" />
        <div className="flex-1">
          <h2 className="text-xl font-black text-white">{user.displayName}</h2>
          <p className="text-xs text-slate-400 font-bold">{user.email || 'Guest Account'}</p>
        </div>
      </div>

      <div className="bento-item glass-dark space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Settings</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            <span className="font-bold text-sm text-slate-300">Dark Mode</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-cyan-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
            <span className="font-bold text-sm text-slate-300">Sound Effects</span>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-6 rounded-full transition-all relative ${!isMuted ? 'bg-cyan-500' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${!isMuted ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      <div className="bento-item glass-dark space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Support & Info</h3>
        
        <button 
          onClick={handleSupportUs}
          className="w-full flex items-center justify-between py-4 px-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all mb-4"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-black text-sm text-yellow-400 uppercase tracking-widest">Support Us</span>
          </div>
          <ExternalLink className="w-4 h-4 text-yellow-400" />
        </button>

        <a href="#" className="flex items-center justify-between py-3 border-b border-white/5 group hover:bg-white/5 px-2 rounded-lg transition-all">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="font-bold text-sm text-slate-400 group-hover:text-white">Privacy Policy</span>
          </div>
        </a>

        <a href="#" className="flex items-center justify-between py-3 border-b border-white/5 group hover:bg-white/5 px-2 rounded-lg transition-all">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="font-bold text-sm text-slate-400 group-hover:text-white">Contact Us</span>
          </div>
        </a>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 rounded-xl glass border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
