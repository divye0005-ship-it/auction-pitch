const fs = require('fs');
let content = fs.readFileSync('src/components/HomeTab.tsx', 'utf-8');

content = content.replace(
  "export default function HomeTab({ user, handlePlaySolo, handleJoinMatchmaking }: HomeTabProps) {",
  "export default function HomeTab({ user, handlePlaySolo, handleJoinMatchmaking, setCurrentView }: HomeTabProps) {"
);

fs.writeFileSync('src/components/HomeTab.tsx', content);
console.log('Fixed HomeTab props');
