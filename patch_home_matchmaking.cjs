const fs = require('fs');
let content = fs.readFileSync('src/components/HomeTab.tsx', 'utf-8');

// Modify HomeTabProps
content = content.replace(
  "interface HomeTabProps {\n  user: UserProfile;\n  setRoom: (room: any) => void;\n  setCurrentView: (view: any) => void;\n  handleCreateRoom: (category: string) => void;\n  handlePlaySolo: (category: string) => void;\n}",
  "interface HomeTabProps {\n  user: UserProfile;\n  setRoom: (room: any) => void;\n  setCurrentView: (view: any) => void;\n  handleCreateRoom: (category: string) => void;\n  handlePlaySolo: (category: string) => void;\n  handleJoinMatchmaking: (category: string) => void;\n}"
);

// Modify HomeTab signature
content = content.replace(
  "export default function HomeTab({ user, setRoom, setCurrentView, handleCreateRoom, handlePlaySolo }: HomeTabProps) {",
  "export default function HomeTab({ user, setRoom, setCurrentView, handleCreateRoom, handlePlaySolo, handleJoinMatchmaking }: HomeTabProps) {"
);

// We need to keep total fake liveUsers just for general UI, but maybe remove it?
// The user said "fake online players show mat karo".
// I will just remove the whole fake live users top banner.

content = content.replace(/<div className="flex items-center gap-2 px-3 py-1\.5 rounded-full bg-green-500\/10 border border-green-500\/20">[\s\S]*?<\/div>/, "");

fs.writeFileSync('src/components/HomeTab.tsx', content);
console.log('Home matchmaking patched.');
