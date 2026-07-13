const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  "import { CAR_DATA } from './services/carData';",
  "import { CAR_DATA } from './services/carData';\nimport { generateRoomId } from './lib/auctionUtils';"
);
fs.writeFileSync('src/App.tsx', content);
