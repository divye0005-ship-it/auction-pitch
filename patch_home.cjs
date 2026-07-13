const fs = require('fs');
let content = fs.readFileSync('src/components/HomeTab.tsx', 'utf-8');

// Modify HomeTabProps
content = content.replace(
  "interface HomeTabProps {\n  user: UserProfile;\n  setRoom: (room: any) => void;\n  setCurrentView: (view: any) => void;\n}",
  "interface HomeTabProps {\n  user: UserProfile;\n  setRoom: (room: any) => void;\n  setCurrentView: (view: any) => void;\n  handleCreateRoom: (category: string) => void;\n  handlePlaySolo: (category: string) => void;\n}"
);

// Modify HomeTab signature
content = content.replace(
  "export default function HomeTab({ user, setRoom, setCurrentView }: HomeTabProps) {",
  "export default function HomeTab({ user, setRoom, setCurrentView, handleCreateRoom, handlePlaySolo }: HomeTabProps) {"
);

// Remove import dbService
content = content.replace("import { dbService } from '../services/dbService';\n", "");

// Replace createAndJoinMatch
content = content.replace(
  /const createAndJoinMatch = async \(\) => \{[\s\S]*?\};\n/,
  "const createAndJoinMatch = () => {\n    handleCreateRoom(selectedMode || 'ipl');\n  };\n"
);

// Replace handlePlaySolo implementation inside HomeTab (rename it to avoid conflict or remove it)
content = content.replace(
  /const handlePlaySolo = async \(mode: string\) => \{[\s\S]*?\};\n/,
  "" // Remove it entirely since we passed it in props and it's already called with `mode`
);

fs.writeFileSync('src/components/HomeTab.tsx', content);
console.log('Home patched.');
