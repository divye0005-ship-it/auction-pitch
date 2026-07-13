const fs = require('fs');

const rawData = fs.readFileSync('parse_cars.cjs', 'utf-8');
const linesText = rawData.substring(rawData.indexOf('const rawData = `') + 17, rawData.indexOf('`;\n\n// Helper'));

// Helper to determine image based on brand for a realistic touch
const getImageForBrand = (brand) => {
  const images = {
    'Ferrari': 'https://images.unsplash.com/photo-1592853625511-85c8e03e488d?auto=format&fit=crop&q=80&w=800',
    'Lamborghini': 'https://images.unsplash.com/photo-1544636331-e26879cd3d9a?auto=format&fit=crop&q=80&w=800',
    'Porsche': 'https://images.unsplash.com/photo-1503376713134-9276d42da34e?auto=format&fit=crop&q=80&w=800',
    'McLaren': 'https://images.unsplash.com/photo-1620882814836-98a44737d771?auto=format&fit=crop&q=80&w=800',
    'Bugatti': 'https://images.unsplash.com/photo-1627454819213-92f7596c342d?auto=format&fit=crop&q=80&w=800',
    'Aston Martin': 'https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?auto=format&fit=crop&q=80&w=800',
    'Mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    'Audi': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800',
    'Nissan': 'https://images.unsplash.com/photo-1603912699214-8f244199c0d5?auto=format&fit=crop&q=80&w=800',
  };
  
  for (const [key, value] of Object.entries(images)) {
    if (brand.includes(key)) return value;
  }
  return 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'; // Default car image
};

const lines = linesText.trim().split('\n');
const cars = lines.map(line => {
  const match = line.match(/(CAR\d+)\s+(.+?)\s+(Supercar|JDM Legend|Track Weapon|Classic|Luxury)\s+(\d+)\s+(\d+)\s+km\/h\s+(\$[0-9,]+)\s+([\d.]+)/);
  if (!match) {
    const parts = line.split(/\s+/);
    // fallback parsing
    const id = parts[0];
    const score = parts[parts.length - 1];
    const priceStr = parts[parts.length - 2];
    const topSpeed = parts[parts.length - 4]; // skip km/h
    const hp = parts[parts.length - 5];
    const roleMatch = line.match(/(Supercar|JDM Legend|Track Weapon|Classic|Luxury)/);
    const category = roleMatch ? roleMatch[1] : 'Supercar';
    
    // name is between ID and category
    const nameStr = line.substring(line.indexOf(id) + id.length, line.indexOf(category)).trim();
    
    const brand = nameStr.split(' ')[0];
    
    return {
      playerId: id.toLowerCase(),
      name: nameStr.toUpperCase(),
      team: brand,
      role: category,
      photoUrl: getImageForBrand(brand),
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
    photoUrl: getImageForBrand(brand),
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
console.log('carData.ts updated with ' + cars.length + ' cars.');
