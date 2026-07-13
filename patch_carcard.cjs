const fs = require('fs');
let content = fs.readFileSync('src/components/CarAuctionCard.tsx', 'utf-8');

// Import LuxuryImage
if (!content.includes('import LuxuryImage')) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport LuxuryImage from './LuxuryImage';");
}

// Replace <img ... /> with <LuxuryImage ... />
content = content.replace(
  /<img\s+src=\{player\.photoUrl\}\s+alt=\{player\.name\}\s+className="w-full h-full object-cover"/,
  `<LuxuryImage src={player.photoUrl} alt={player.name} className="w-full h-full object-cover"`
);

fs.writeFileSync('src/components/CarAuctionCard.tsx', content);
