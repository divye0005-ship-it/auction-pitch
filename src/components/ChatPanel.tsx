import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Smile, Zap } from 'lucide-react';
import { Message } from '../types';
import { dbService } from '../services/dbService';

interface ChatPanelProps {
  roomId: string;
  userId: string;
  userName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ roomId, userId, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [reactions, setReactions] = useState<{ id: number, emoji: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = dbService.subscribeToMessages(roomId, (msgs) => {
      setMessages(msgs);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });
    return () => unsubscribe();
  }, [roomId, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      userId,
      userName,
      text: inputText.trim(),
      timestamp: null,
    };

    setInputText('');
    await dbService.sendMessage(roomId, newMessage);
  };

  const handleReaction = (emoji: string) => {
    const id = Date.now();
    setReactions(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const emojis = ['🔥', '😱', '💰', '👑', '😂', '⚡'];

  return (
    <>
      {/* Floating Reactions */}
      <div className="fixed bottom-24 right-4 z-50 pointer-events-none">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -300, opacity: 0, scale: 3, rotate: Math.random() * 40 - 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="text-5xl absolute bottom-0 right-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl glass-dark border-cyan-400/30 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X className="w-7 h-7 relative z-10" /> : <MessageSquare className="w-7 h-7 relative z-10" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm glass-dark border-l border-white/10 z-40 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Real-time</span>
                <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Live Chat
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{msg.userName}</span>
                  <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm font-medium leading-relaxed shadow-lg ${
                    msg.userId === userId 
                      ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black rounded-tr-none' 
                      : 'bg-white/10 text-white border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50">
                  <MessageSquare className="w-12 h-12" />
                  <p className="text-xs font-black uppercase tracking-widest">No messages yet</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex gap-3 mb-6 justify-center">
                {emojis.map(e => (
                  <button
                    key={e}
                    onClick={() => handleReaction(e)}
                    className="text-2xl hover:scale-150 active:scale-90 transition-transform duration-200"
                  >
                    {e}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-colors placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="w-12 h-12 rounded-2xl bg-cyan-400 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
