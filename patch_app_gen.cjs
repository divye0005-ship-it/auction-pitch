const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/const generateRoomId = \(\) => \{\n    return Math\.random\(\)\.toString\(36\)\.substring\(2, 8\)\.toUpperCase\(\);\n  \};\n/g, "");
content = content.replace("import { auth, db } from './firebase';", "import { auth, db } from './firebase';\nimport { generateRoomId } from './lib/auctionUtils';");

// Fix matchmakingCategory state
content = content.replace(
  /const handleJoinMatchmaking = \(category: string\) => \{(\n\s*)setMatchmakingCategory\(category\);/g,
  "const [matchmakingCategory, setMatchmakingCategory] = useState<any>('ipl');\n  const handleJoinMatchmaking = (category: string) => {$1setMatchmakingCategory(category);"
);

// Fix RoomsTabProps in App.tsx
// I will just completely remove RoomsTab from App.tsx rendering since we use Matchmaking
content = content.replace(/\{currentView === 'rooms' && \([\s\S]*?\}\)/g, "");

// Fix HomeTabProps handleJoinMatchmaking
content = content.replace(
  /<HomeTab \n                user=\{user!\}\n                setRoom=\{setRoom\}\n                setCurrentView=\{setCurrentView\}\n                handleCreateRoom=\{handleCreateRoom\}\n                handlePlaySolo=\{handlePlaySolo\}\n              \/>/g,
  `<HomeTab 
                user={user!}
                setRoom={setRoom}
                setCurrentView={setCurrentView}
                handleCreateRoom={handleCreateRoom}
                handlePlaySolo={handlePlaySolo}
                handleJoinMatchmaking={handleJoinMatchmaking}
              />`
);

fs.writeFileSync('src/App.tsx', content);
console.log('App fixed generateRoomId.');
