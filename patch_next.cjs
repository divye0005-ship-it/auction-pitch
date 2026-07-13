const fs = require('fs');
let content = fs.readFileSync('src/components/AuctionGameplay.tsx', 'utf-8');

content = content.replace(
  /speak\(\`Next player: \$\{p\.name\}\. Base price: \$\{p\.basePrice >= 100 \? \(p\.basePrice\/100\)\.toFixed\(2\) \+ ' Crore' : p\.basePrice \+ ' Lakhs'\}\`\);/,
  "speak(`Next ${room.category === 'car' ? 'car' : 'player'}: ${p.name}. Base price: ${p.basePrice >= 100 ? (p.basePrice/100).toFixed(2) + ' Crore' : p.basePrice + ' Lakhs'}`);"
);

fs.writeFileSync('src/components/AuctionGameplay.tsx', content);
console.log('Next car speech patched.');
