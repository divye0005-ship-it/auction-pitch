const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const roomsBtn = `
              <button 
                onClick={() => setCurrentView('rooms')}
                className={\`flex flex-col items-center gap-1 transition-all \${currentView === 'rooms' ? 'text-purple-400' : 'text-slate-500'}\`}
              >
                <div className={\`p-2 rounded-xl \${currentView === 'rooms' ? 'bg-purple-400/10' : ''}\`}>
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Rooms</span>
              </button>
`;

content = content.replace(
  /<button \n\s*onClick=\{\(\) => setCurrentView\('leaderboard'\)\}/m,
  roomsBtn + "\n              <button \n                onClick={() => setCurrentView('leaderboard')}"
);

fs.writeFileSync('src/App.tsx', content);
