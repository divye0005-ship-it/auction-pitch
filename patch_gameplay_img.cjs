const fs = require('fs');
let content = fs.readFileSync('src/components/AuctionGameplay.tsx', 'utf-8');

if (!content.includes('import LuxuryImage')) {
  content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport LuxuryImage from './LuxuryImage';");
}

// In AuctionGameplay, the current player image might be rendered:
// <img src={currentPlayer.photoUrl} alt={currentPlayer.name} className="w-full h-full object-cover object-top" />
// or similar.
content = content.replace(
  /<img\n\s*src=\{currentPlayer\.photoUrl\}\n\s*alt=\{currentPlayer\.name\}\n\s*className="w-full h-full object-cover object-top"/g,
  `<LuxuryImage src={currentPlayer.photoUrl} alt={currentPlayer.name} className="w-full h-full object-cover object-top"`
);

content = content.replace(
  /<img\s*src=\{currentPlayer\.photoUrl\}\s*alt=\{currentPlayer\.name\}\s*className="w-full h-full object-cover object-top"/g,
  `<LuxuryImage src={currentPlayer.photoUrl} alt={currentPlayer.name} className="w-full h-full object-cover object-top"`
);

// We should also replace it in the squad list if there is one, but the squad list probably uses the same `<img>` tag or small icons. Let's see:
// <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover object-top" />
content = content.replace(
  /<img\n\s*src=\{member\.photoUrl\}\n\s*alt=\{member\.name\}\n\s*className="w-full h-full object-cover/g,
  `<LuxuryImage src={member.photoUrl} alt={member.name} className="w-full h-full object-cover`
);

fs.writeFileSync('src/components/AuctionGameplay.tsx', content);
