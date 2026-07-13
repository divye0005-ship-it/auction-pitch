const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We need to import MatchmakingScreen
content = content.replace("import ResultsScreen from './components/ResultsScreen';", "import ResultsScreen from './components/ResultsScreen';\nimport MatchmakingScreen from './components/MatchmakingScreen';");

// Inside return of App.tsx, replace the matchmaking route? Wait, there is no matchmaking route yet.
// Current views: 'home', 'play', 'results', 'rooms', 'profile', 'support'
// Let's add 'matchmaking' to the valid views, but wait, `currentView` is a string.

content = content.replace(
  /const \[currentView, setCurrentView\] = useState\('home'\);/,
  "const [currentView, setCurrentView] = useState('home');\n  const [matchmakingCategory, setMatchmakingCategory] = useState('ipl');"
);

// Function to start matchmaking
const handleJoinMatchmaking = `
  const handleJoinMatchmaking = (category: string) => {
    setMatchmakingCategory(category);
    setCurrentView('matchmaking');
  };
`;
content = content.replace("const handleCreateRoom = async", handleJoinMatchmaking + "\n  const handleCreateRoom = async");

// Add handleJoinMatchmaking to HomeTab props
content = content.replace(
  /handleCreateRoom=\{handleCreateRoom\}\s*handlePlaySolo=\{handlePlaySolo\}/,
  "handleJoinMatchmaking={handleJoinMatchmaking} handleCreateRoom={handleCreateRoom} handlePlaySolo={handlePlaySolo}"
);

// Add MatchmakingScreen to the render loop
const matchmakingScreenCode = `
          {currentView === 'matchmaking' && (
            <MatchmakingScreen
              user={user!}
              category={matchmakingCategory}
              onBack={() => setCurrentView('home')}
              onJoinRoom={(roomId) => {
                // Fetch the room directly?
                // The current Join logic handles fetching. Let's just use handleJoinRoomById
                handleJoinRoomById(roomId);
              }}
              onPlaySolo={(category) => {
                handlePlaySolo(category);
              }}
            />
          )}
`;
content = content.replace("{currentView === 'home' && (", matchmakingScreenCode + "\n          {currentView === 'home' && (");

fs.writeFileSync('src/App.tsx', content);
console.log('App matchmaking patched.');
