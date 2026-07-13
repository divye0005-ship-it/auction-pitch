const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const lines = content.split('\n');
const startLine = 811; // 0-indexed would be 811 for line 812
const endLine = 1316; // 0-indexed for 1317

const newCode = `            {currentView === 'leaderboard' ? (
              <Leaderboard onBack={() => setCurrentView('home')} />
            ) : currentView === 'profile' ? (
              <ProfileTab 
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
                handleCreateRoom={handleCreateRoom}
                handlePlaySolo={handlePlaySolo}
                isCreating={isCreating}
                createOptions={createOptions}
                setCreateOptions={setCreateOptions}
                joinCode={joinCode}
                setJoinCode={setJoinCode}
                handleJoinRoom={handleJoinRoom}
                isAdmin={user?.role === 'admin'}
              />
            ) : (
              <HomeTab 
                user={user!}
                setRoom={setRoom}
                setCurrentView={setCurrentView}
              />
            )}`;

const newLines = [
  ...lines.slice(0, startLine),
  newCode,
  ...lines.slice(endLine + 1)
];

fs.writeFileSync('src/App.tsx', newLines.join('\n'));
console.log('App.tsx patched successfully.');
