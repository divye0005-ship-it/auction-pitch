const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Modify handleCreateRoom signature and room object
content = content.replace(
  "const handleCreateRoom = async () => {",
  "const handleCreateRoom = async (category: any = 'ipl') => {"
);
content = content.replace(
  "roomId,\n        title: `${user.displayName}'s Auction`,",
  "roomId,\n        category,\n        title: `${user.displayName}'s Auction`,"
);

// Modify handlePlaySolo signature and room object
content = content.replace(
  "const handlePlaySolo = async () => {",
  "const handlePlaySolo = async (category: any = 'ipl') => {"
);
content = content.replace(
  "roomId,\n        title: `Solo Challenge vs AI`,",
  "roomId,\n        category,\n        title: `Solo Challenge vs AI`,"
);

// Make sure handleCreateRoom and handlePlaySolo calls in HomeTab are passed these functions
fs.writeFileSync('src/App.tsx', content);
console.log('App patched.');
