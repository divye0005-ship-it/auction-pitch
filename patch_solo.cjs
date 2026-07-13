const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  "roomId,\n        title: `${user.displayName}'s Solo Auction`,",
  "roomId,\n        category,\n        title: `${user.displayName}'s Solo Auction`,"
);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed solo.');
