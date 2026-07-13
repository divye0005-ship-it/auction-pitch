const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "import { IPL_PLAYERS } from './services/playerData';",
  "import { IPL_PLAYERS } from './services/playerData';\nimport { CAR_DATA } from './services/carData';"
);

content = content.replace(
  /allPlayers=\{IPL_PLAYERS\}/g,
  "allPlayers={room?.category === 'car' ? CAR_DATA : IPL_PLAYERS}"
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx players patched.');
