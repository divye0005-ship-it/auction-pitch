const fs = require('fs');
let content = fs.readFileSync('src/components/AuctionGameplay.tsx', 'utf-8');

// Replace "Audi RS7" speech bug -> replace 'RS' with 'R S ' for speech ONLY
content = content.replace(
  /speak\(\`Next \$\{room.category === 'car' \? 'car' : 'player'\}\: \$\{p\.name\}\./,
  "speak(`Next ${room.category === 'car' ? 'car' : 'player'}: ${p.name.replace(/RS/g, 'R S ')}."
);

fs.writeFileSync('src/components/AuctionGameplay.tsx', content);
console.log('Audi RS bug fixed');
