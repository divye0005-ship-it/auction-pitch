import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, Player, UserProfile } from '../types';
import { dbService } from '../services/dbService';
import AuctionCard from './AuctionCard';
import { getNextBidAmount } from '../lib/auctionUtils';
import { Zap, Plus, Timer as TimerIcon, Wallet, Users, SkipForward, Trophy, TrendingUp, Volume2, VolumeX } from 'lucide-react';

interface AuctionGameplayProps {
  room: Room;
  user: UserProfile;
  allPlayers: Player[];
  isMuted: boolean;
  onQuit: () => void;
  onTerminate?: () => void;
}

const AuctionGameplay: React.FC<AuctionGameplayProps> = ({ room, user, allPlayers, isMuted, onQuit, onTerminate }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [timeLeft, setTimeLeft] = useState(room.revealTimer);
  const [bidPulse, setBidPulse] = useState(false);
  const [showSquads, setShowSquads] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const playersArr = React.useMemo(() => Object.values(room.players) as any[], [room.players]);
  const currentBid = room.currentBidAmount || 0;
  const currentBidderId = room.currentBidderId;
  const currentBidder = React.useMemo(() => currentBidderId ? room.players[currentBidderId] : null, [currentBidderId, room.players]);
  const myPurse = room.purses[user.uid] || 0;
  const hasVotedToSkip = room.skipVotes?.includes(user.uid);
  const humanPlayers = React.useMemo(() => playersArr.filter(p => !p.isBot), [playersArr]);

  const speak = React.useCallback((text: string) => {
    if (!window.speechSynthesis || isMuted) return;
    
    // Cancel any ongoing speech to ensure the latest update is heard immediately
    // but we'll be more selective to avoid a "glitchy" robotic sound
    const isSoldMessage = text.toLowerCase().includes('sold') || text.toLowerCase().includes('unsold');
    
    if (!isSoldMessage) {
      window.speechSynthesis.cancel();
    }
    
    const msg = new SpeechSynthesisUtterance(text);
    
    // Prioritize high-quality Indian Female voices
    const indianFemaleVoice = voices.find(v => 
      (v.lang.includes('IN') || v.name.toLowerCase().includes('india')) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('veena')) &&
      !v.name.toLowerCase().includes('google') // Prefer system voices over Google ones if possible for better quality
    ) || voices.find(v => 
      (v.lang.includes('IN') || v.name.toLowerCase().includes('india')) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('veena'))
    ) || voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-GB'));
    
    if (indianFemaleVoice) {
      msg.voice = indianFemaleVoice;
    }
    
    msg.rate = 1.2; // Faster, more energetic speed
    msg.pitch = 1.1; // Slightly higher for a more pleasant, professional tone
    msg.volume = 1.0;
    
    window.speechSynthesis.speak(msg);
  }, [isMuted, voices]);

  // Audio announcements for bids
  useEffect(() => {
    if (currentBid > 0 && !isMuted) {
      let text = "";
      if (currentBid >= 100) {
        const cr = (currentBid / 100).toFixed(2);
        text = `${parseFloat(cr)} Crore`;
      } else {
        text = `${currentBid} Lakhs`;
      }
      speak(text);
    }
  }, [currentBid, isMuted, speak]);

  // Cancel speech immediately when muted
  useEffect(() => {
    if (isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  // Select next player if none active
  useEffect(() => {
    if (room.status === 'active' && !room.currentPlayerId && room.hostId === user.uid) {
      const availablePlayers = allPlayers.filter(p => !room.auctionedPlayerIds.includes(p.playerId));
      if (availablePlayers.length === 0) {
        dbService.updateRoom(room.roomId, { status: 'finished' });
        return;
      }
      const nextPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      dbService.updateRoom(room.roomId, { 
        currentPlayerId: nextPlayer.playerId,
        currentBidAmount: 0,
        currentBidderId: null,
        timerEnd: Date.now() + (room.revealTimer * 1000),
        skipVotes: []
      });
    }
  }, [room.status, room.currentPlayerId, room.hostId, user.uid, allPlayers, room.auctionedPlayerIds, room.revealTimer, room.roomId]);

  // Sync current player and announce
  useEffect(() => {
    if (room.currentPlayerId) {
      const p = allPlayers.find(pl => pl.playerId === room.currentPlayerId);
      if (p && p.playerId !== currentPlayer?.playerId) {
        setCurrentPlayer(p);
        // Immediate announcement
        speak(`Next player: ${p.name}. Base price: ${p.basePrice >= 100 ? (p.basePrice/100).toFixed(2) + ' Crore' : p.basePrice + ' Lakhs'}`);
      }
    }
  }, [room.currentPlayerId, allPlayers, currentPlayer, speak]);

  // Timer logic
  useEffect(() => {
    if (room.timerEnd && room.status === 'active') {
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((room.timerEnd! - now) / 1000));
        setTimeLeft(diff);

        // Only the host triggers the end of the auction
        // We add a small grace period to allow for network propagation of last-second bids
        if (diff === 0 && room.hostId === user.uid && room.currentPlayerId) {
          handleAuctionEnd();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 500); // Check more frequently
      return () => clearInterval(interval);
    }
  }, [room.timerEnd, room.hostId, user.uid, room.status, room.currentPlayerId]);

  const handleAuctionEnd = async () => {
    if (!currentPlayer || !room.currentPlayerId) return;

    // Use a local copy of the player ID to ensure we're ending the correct auction
    const endingPlayerId = room.currentPlayerId;
    const endingPlayerScore = currentPlayer.auctionScore;

    try {
      if (currentBidderId) {
        const buyerName = room.players[currentBidderId]?.displayName || "Someone";
        speak(`${currentPlayer.name} sold to ${buyerName} for ${currentBid >= 100 ? (currentBid/100).toFixed(2) + ' Crore' : currentBid + ' Lakhs'}`);
      } else {
        speak(`${currentPlayer.name} remained unsold`);
      }

      // Call the transaction-based completion method
      await dbService.completeAuction(room.roomId, endingPlayerId, endingPlayerScore);
    } catch (error) {
      console.error("Failed to complete auction:", error);
    }
  };

  const handleBid = async () => {
    if (!currentPlayer || currentBidderId === user.uid) return;
    
    const mySquad = room.squads[user.uid] || [];
    if (mySquad.length >= 25) {
      alert("Maximum squad size (25) reached!");
      return;
    }

    const nextBid = getNextBidAmount(currentBid, currentPlayer.basePrice);

    if (myPurse < nextBid) {
      alert("Not enough purse!");
      return;
    }

    setBidPulse(true);
    setTimeout(() => setBidPulse(false), 300);

    try {
      await dbService.bidOnPlayer(room.roomId, user.uid, nextBid, room.revealTimer, currentPlayer.basePrice);
    } catch (error: any) {
      console.error("Bid failed:", error);
    }
  };

  const handleSkipVote = async () => {
    if (hasVotedToSkip) return;
    
    // Count only human players for the skip vote
    const currentVotes = room.skipVotes || [];
    
    if (currentVotes.length + 1 >= humanPlayers.length) {
      // Skip player
      await dbService.skipPlayer(room.roomId, currentPlayer?.playerId || '', room.auctionedPlayerIds);
    } else {
      // Use arrayUnion for safer updates
      await dbService.updateRoom(room.roomId, { 
        skipVotes: [...currentVotes, user.uid]
      });
    }
  };

  // Bot Logic
  useEffect(() => {
    const botPlayers = playersArr.filter(p => p.isBot);
    if (botPlayers.length > 0 && room.hostId === user.uid && room.status === 'active' && currentPlayer) {
      const botInterval = setInterval(() => {
        botPlayers.forEach(bot => {
          const botPurse = room.purses[bot.uid] || 0;
          const botSquad = room.squads[bot.uid] || [];
          
          // Bot Personalities based on UID hash
          const botHash = bot.uid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const isAggressive = botHash % 3 === 0;
          const isConservative = botHash % 3 === 1;
          
          // Valuation logic: More selective
          // Base valuation on score and role
          let valuationMultiplier = 15;
          if (currentPlayer.auctionScore > 90) valuationMultiplier = isAggressive ? 45 : 35;
          else if (currentPlayer.auctionScore > 80) valuationMultiplier = isAggressive ? 30 : 22;
          else if (currentPlayer.auctionScore > 70) valuationMultiplier = isAggressive ? 20 : 15;
          else valuationMultiplier = isAggressive ? 12 : 8;

          // Role-based valuation (bots prioritize what they need)
          const squadRoles = botSquad.map(id => allPlayers.find(pl => pl.playerId === id)?.role).filter(Boolean);
          const roleCount = squadRoles.filter(r => r === currentPlayer.role).length;
          
          // If they already have many of this role, they bid less
          if (roleCount >= 4) valuationMultiplier *= 0.5;
          else if (roleCount >= 2) valuationMultiplier *= 0.8;
          
          // Conservative bots bid less
          if (isConservative) valuationMultiplier *= 0.7;

          const valuation = Math.max(currentPlayer.basePrice * 2, currentPlayer.auctionScore * valuationMultiplier);
          
          // Bots become extremely aggressive as time runs out or if they have few players
          const squadUrgency = botSquad.length < 7 ? 0.95 : botSquad.length < 15 ? 0.7 : 0.4;
          const timeUrgency = timeLeft <= 3 ? 0.98 : timeLeft <= 8 ? 0.8 : squadUrgency;
          
          // Only bid if not already the highest bidder and within valuation
          if (botSquad.length < 25 && currentBidderId !== bot.uid && currentBid < valuation && botPurse > currentBid + 50) {
            // Higher probability of bidding if valuation is much higher than current bid
            const valuationGap = (valuation - currentBid) / valuation;
            let bidProbability = Math.max(timeUrgency * 0.5, valuationGap);
            
            // Random factor to make them less robotic
            if (Math.random() > 0.7) bidProbability *= 0.5;

            if (Math.random() < bidProbability) { 
              const nextBid = getNextBidAmount(currentBid, currentPlayer.basePrice);
              if (botPurse >= nextBid) {
                dbService.bidOnPlayer(room.roomId, bot.uid, nextBid, room.revealTimer, currentPlayer.basePrice);
              }
            }
          }
        });
      }, 800); // Slightly slower check to feel more human
      return () => clearInterval(botInterval);
    }
  }, [currentBid, currentBidderId, room.hostId, user.uid, currentPlayer, playersArr, room.purses, room.revealTimer, room.roomId, room.status, timeLeft, allPlayers]);

  const timerPercentage = (timeLeft / room.revealTimer) * 100;

  return (
    <div className="flex-1 p-4 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto pb-32 md:pb-12 relative">
      {/* Stadium Background Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] aspect-square bg-gradient-to-b from-cyan-500/20 to-transparent rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-500/10 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full relative z-10">
        
        {/* Left Column: Player Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6 md:gap-8">
          <div className="relative w-full max-w-[280px] sm:max-w-md">
            <AuctionCard 
              player={currentPlayer} 
              isRevealed={true} 
            />
            
            {/* Timer Ring */}
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-16 h-16 md:w-24 md:h-24">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="50%" cy="50%" r="40%"
                  className="stroke-white/5 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50%" cy="50%" r="40%"
                  className={`fill-none ${timeLeft <= 5 ? 'stroke-red-500' : 'stroke-cyan-400'}`}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  animate={{ strokeDashoffset: 251.2 - (251.2 * timerPercentage) / 100 }}
                  transition={{ duration: 1, ease: "linear" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg md:text-2xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Mute Indicator */}
            <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4">
              <div className={`p-2 rounded-xl glass backdrop-blur-md border border-white/10 ${isMuted ? 'text-red-500' : 'text-cyan-400'}`}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Skip Button */}
          <div className="w-full flex flex-col gap-3">
            {/* Mobile Bid Button */}
            <div className="lg:hidden w-full">
              <button 
                onClick={handleBid}
                disabled={currentBidderId === user.uid || myPurse < getNextBidAmount(currentBid, currentPlayer?.basePrice || 50)}
                className={`w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black text-lg tracking-widest uppercase flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all ${currentBidderId === user.uid ? 'cursor-not-allowed' : ''}`}
              >
                <Plus className="w-6 h-6" />
                {currentBidderId === user.uid ? 'Waiting...' : `Bid ₹${getNextBidAmount(currentBid, currentPlayer?.basePrice || 50)}L`}
              </button>
            </div>

            <button 
              onClick={handleSkipVote}
              disabled={hasVotedToSkip}
              className={`w-full px-8 py-4 rounded-2xl glass flex items-center justify-center gap-3 transition-all ${hasVotedToSkip ? 'opacity-50 grayscale' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
            >
              <SkipForward className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Skip ({room.skipVotes?.length || 0}/{humanPlayers.length})
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Bidding Controls & Stats */}
        <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6">
          
          {/* Current Bid Status */}
          <div className={`bento-item glass-dark relative overflow-hidden transition-all duration-300 ${bidPulse ? 'scale-[1.02] border-cyan-400/50' : ''}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-8 relative z-10">
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Live Auction</span>
                </div>
                <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-5xl md:text-7xl font-black font-display tracking-tighter text-white">
                    ₹{currentBid || 0}
                  </span>
                  <span className="text-xl md:text-2xl font-black text-cyan-400 uppercase font-display">Lakhs</span>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Highest Bidder</span>
                {currentBidder ? (
                  <div className="flex items-center gap-3 md:gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <img src={currentBidder.photoURL} className="w-8 h-8 md:w-10 md:h-10 rounded-xl" alt="" />
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm font-black uppercase tracking-tight">{currentBidder.displayName}</span>
                      <span className="text-[8px] md:text-[9px] font-black text-cyan-400 uppercase tracking-widest">Leading</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-3 rounded-2xl border border-dashed border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    No Bids Yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bid Button & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bento-item glass-dark flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Your Purse</span>
                      <div className="flex items-center gap-2 text-xl md:text-2xl font-black font-mono text-green-400">
                        <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                        ₹{(myPurse / 100).toFixed(2)} Cr
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Squad</span>
                      <div className={`text-lg md:text-xl font-black font-mono ${(room.squads[user.uid]?.length || 0) < 11 ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {room.squads[user.uid]?.length || 0}/25
                      </div>
                    </div>
                  </div>
              
              {/* Desktop Bid Button */}
              <button 
                onClick={handleBid}
                disabled={currentBidderId === user.uid || myPurse < getNextBidAmount(currentBid, currentPlayer?.basePrice || 50)}
                className={`hidden lg:flex w-full py-5 md:py-6 rounded-[1.5rem] bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-black text-lg md:text-xl tracking-widest uppercase items-center justify-center gap-3 md:gap-4 shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all ${currentBidderId === user.uid ? 'cursor-not-allowed' : ''}`}
              >
                <Plus className="w-6 h-6 md:w-8 md:h-8" />
                {currentBidderId === user.uid ? 'Waiting...' : `Bid ₹${getNextBidAmount(currentBid, currentPlayer?.basePrice || 50)}L`}
              </button>
            </div>

            <div className="bento-item glass-dark p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Live Participants
              </h3>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {playersArr.map(p => (
                  <div key={p.uid} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <img src={p.photoURL} className="w-6 h-6 rounded-lg" alt="" />
                      <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[80px]">{p.displayName}</span>
                    </div>
                    <span className="text-[9px] font-black font-mono text-slate-400">
                      ₹{(room.purses[p.uid] / 100).toFixed(1)} Cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="bento-item glass-dark bg-gradient-to-br from-cyan-500/5 to-purple-500/5 flex items-center justify-around py-6 md:py-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sold</span>
              <span className="text-xl md:text-2xl font-black font-display">{room.auctionedPlayerIds.length}</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Base</span>
              <span className="text-xl md:text-2xl font-black font-display text-cyan-400">₹{Math.max(50, currentPlayer?.basePrice || 50)}L</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Inc</span>
              <span className="text-xl md:text-2xl font-black font-display text-purple-400">₹{currentBid < 200 ? '10' : '25'}L</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row justify-center items-center gap-3 mt-2">
            <button 
              onClick={() => setShowSquads(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl glass text-cyan-400 hover:text-white hover:bg-cyan-500/10 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Squads
            </button>
            <button 
              onClick={onQuit}
              className="w-full sm:w-auto px-4 py-3 rounded-xl glass text-slate-500 hover:text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center"
            >
              Quit
            </button>
            {onTerminate && (
              <button 
                onClick={onTerminate}
                className="col-span-2 sm:w-auto px-4 py-3 rounded-xl glass text-red-500 hover:text-white hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center"
              >
                Terminate
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Squads Modal */}
      <AnimatePresence>
        {showSquads && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#050505]/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-5xl h-full max-h-[85vh] glass-dark rounded-[2.5rem] overflow-hidden flex flex-col relative"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase tracking-tighter font-display">Auction Squads</h2>
                <button 
                  onClick={() => setShowSquads(false)}
                  className="p-4 rounded-2xl glass hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {playersArr.map(p => {
                    const squadIds = room.squads[p.uid] || [];
                    const squadPlayers = squadIds.map(id => allPlayers.find(pl => pl.playerId === id)).filter(Boolean) as Player[];
                    
                    return (
                      <div key={p.uid} className="bento-item glass-dark border-white/5">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <img src={p.photoURL} className="w-12 h-12 rounded-2xl border-2 border-cyan-500/30" alt="" />
                            <div className="flex flex-col">
                              <span className="text-lg font-black uppercase tracking-tight">{p.displayName}</span>
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                Purse: ₹{(room.purses[p.uid] / 100).toFixed(2)} Cr
                              </span>
                            </div>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {squadPlayers.length} Players
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {squadPlayers.map(player => (
                            <div key={player.playerId} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                              <img src={player.photoUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black uppercase tracking-tight truncate">{player.name}</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{player.role}</span>
                              </div>
                            </div>
                          ))}
                          {squadPlayers.length === 0 && (
                            <div className="col-span-full py-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
                              No players bought yet
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuctionGameplay;
