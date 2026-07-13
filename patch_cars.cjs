const fs = require('fs');

const rawData = fs.readFileSync('parse_cars.cjs', 'utf-8');
const linesText = rawData.substring(rawData.indexOf('const rawData = `') + 17, rawData.indexOf('`;\n\n// Helper'));

const lines = linesText.trim().split('\n');
const cars = lines.map(line => {
  const match = line.match(/(CAR\d+)\s+(.+?)\s+(Supercar|JDM Legend|Track Weapon|Classic|Luxury)\s+(\d+)\s+(\d+)\s+km\/h\s+(\$[0-9,]+)\s+([\d.]+)/);
  if (!match) {
    const parts = line.split(/\s+/);
    const id = parts[0];
    const score = parts[parts.length - 1];
    const priceStr = parts[parts.length - 2];
    const topSpeed = parts[parts.length - 4];
    const hp = parts[parts.length - 5];
    const roleMatch = line.match(/(Supercar|JDM Legend|Track Weapon|Classic|Luxury)/);
    const category = roleMatch ? roleMatch[1] : 'Supercar';
    
    const nameStr = line.substring(line.indexOf(id) + id.length, line.indexOf(category)).trim();
    const brand = nameStr.split(' ')[0];
    
    return {
      playerId: id.toLowerCase(),
      name: nameStr.toUpperCase(),
      team: brand,
      role: category,
      photoUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(nameStr + " cinematic studio light dark background 8k")}?width=800&height=1200&nologo=true`,
      country: brand,
      stats: { hp: parseInt(hp, 10), topSpeed: parseInt(topSpeed, 10), value: priceStr },
      auctionScore: Math.round(parseFloat(score) * 20),
      basePrice: 50
    };
  }
  
  const id = match[1];
  const name = match[2].trim();
  const category = match[3];
  const hp = parseInt(match[4], 10);
  const topSpeed = parseInt(match[5], 10);
  const priceStr = match[6];
  const score = parseFloat(match[7]);
  const brand = name.split(' ')[0];
  
  return {
    playerId: id.toLowerCase(),
    name: name.toUpperCase(),
    team: brand,
    role: category,
    photoUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(name + " cinematic studio light dark background 8k")}?width=800&height=1200&nologo=true`,
    country: brand,
    stats: { hp, topSpeed, value: priceStr },
    auctionScore: Math.round(score * 20),
    basePrice: 50
  };
});

const output = `import { Player } from '../types';

export const CAR_DATA: Player[] = ${JSON.stringify(cars, null, 2)};
`;

fs.writeFileSync('src/services/carData.ts', output);
console.log('carData.ts updated with Pollinations images.');
