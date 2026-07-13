const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Restore import RoomsTab
content = content.replace("import ProfileTab from './components/ProfileTab';", "import ProfileTab from './components/ProfileTab';\nimport RoomsTab from './components/RoomsTab';");

// Restore RoomsTab in render (after ProfileTab)
content = content.replace(
  /<ProfileTab\n\s*user=\{user\}\n\s*isDarkMode=\{isDarkMode\}\n\s*setIsDarkMode=\{setIsDarkMode\}\n\s*isMuted=\{isMuted\}\n\s*setIsMuted=\{setIsMuted\}\n\s*onLogout=\{handleLogout\}\n\s*\/>/m,
  `<ProfileTab
                user={user}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                onLogout={handleLogout}
              />
            ) : currentView === 'rooms' ? (
              <RoomsTab
                user={user!}
                publicRooms={publicRooms}
                fetchPublicRooms={fetchPublicRooms}
                handleDeleteRoom={handleDeleteRoom}
                handleJoinRoomById={handleJoinRoomById}
                setJoinCode={setJoinCode}
                handleJoinRoom={handleJoinRoom}
                isAdmin={user?.role === 'admin'}
              />`
);

// Restore Rooms bottom nav button
const roomsNavBtn = `
              <button 
                onClick={() => setCurrentView('rooms')}
                className={\`flex flex-col items-center gap-1 transition-all \${currentView === 'rooms' ? 'text-cyan-400' : 'text-slate-500'}\`}
              >
                <div className={\`p-2 rounded-xl \${currentView === 'rooms' ? 'bg-cyan-400/10' : ''}\`}>
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">Rooms</span>
              </button>
`;

content = content.replace(
  /<button \n\s*onClick=\{\(\) => setCurrentView\('leaderboard'\)\}/m,
  roomsNavBtn + "\n              <button \n                onClick={() => setCurrentView('leaderboard')}"
);

// We need to restore 'rooms' in HomeTab? No, RoomsTab has its own logic.
// In HomeTab, let's restore Custom Room creation button.
