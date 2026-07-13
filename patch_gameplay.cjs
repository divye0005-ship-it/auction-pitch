const fs = require('fs');
let content = fs.readFileSync('src/components/AuctionGameplay.tsx', 'utf-8');

// Add import
content = content.replace("import AuctionCard from './AuctionCard';", "import AuctionCard from './AuctionCard';\nimport CarAuctionCard from './CarAuctionCard';");

// Replace render
content = content.replace(
  /<AuctionCard \s*player=\{currentPlayer\} \s*isRevealed=\{true\} \s*\/>/g,
  `{room.category === 'car' ? (
              <CarAuctionCard player={currentPlayer} />
            ) : (
              <AuctionCard player={currentPlayer} isRevealed={true} />
            )}`
);

fs.writeFileSync('src/components/AuctionGameplay.tsx', content);
console.log('AuctionGameplay patched.');
