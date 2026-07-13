const fs = require('fs');
let content = fs.readFileSync('src/lib/auctionUtils.ts', 'utf-8');

if (!content.includes('generateRoomId')) {
  content += "\nexport const generateRoomId = () => {\n  return Math.random().toString(36).substring(2, 8).toUpperCase();\n};\n";
  fs.writeFileSync('src/lib/auctionUtils.ts', content);
}

console.log('utils patched');
