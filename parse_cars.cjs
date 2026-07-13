const fs = require('fs');

const rawData = `
CAR001 Ferrari F40 Supercar 927 327 km/h $50,000 48.5
CAR002 Ferrari 458 Italia Supercar 725 334 km/h $50,000 40.5
CAR003 Ferrari LaFerrari Supercar 946 354 km/h $50,000 51.2
CAR004 Ferrari 812 Superfast Supercar 616 321 km/h $50,000 40.1
CAR005 Ferrari SF90 Stradale Supercar 858 358 km/h $50,000 45.6
CAR006 Ferrari Enzo Supercar 932 354 km/h $50,000 50.6
CAR007 Ferrari F8 Tributo Supercar 901 337 km/h $50,000 43.4
CAR008 Ferrari Roma Supercar 681 347 km/h $50,000 41.6
CAR009 Ferrari Portofino Supercar 710 341 km/h $50,000 46.3
CAR010 Ferrari 250 GTO Supercar 649 342 km/h $50,000 46.5
CAR011 Lamborghini Aventador SVJ Supercar 735 322 km/h $50,000 48.0
CAR012 Lamborghini Huracan Performante Supercar 663 344 km/h $50,000 43.5
CAR013 Lamborghini Urus Supercar 921 359 km/h $50,000 48.2
CAR014 Lamborghini Murcielago Supercar 895 332 km/h $50,000 43.4
CAR015 Lamborghini Gallardo Supercar 938 334 km/h $50,000 44.1
CAR016 Lamborghini Sian Supercar 719 326 km/h $50,000 46.1
CAR017 Lamborghini Centenario Supercar 925 343 km/h $50,000 48.6
CAR018 Lamborghini Diablo Supercar 707 337 km/h $50,000 49.7
CAR019 Lamborghini Countach Supercar 931 324 km/h $50,000 46.0
CAR020 Lamborghini Veneno Supercar 873 335 km/h $50,000 49.4
CAR021 Porsche 911 GT3 RS JDM Legend 538 320 km/h $50,000 44.6
CAR022 Porsche 911 Turbo S Track Weapon 566 283 km/h $50,000 39.6
CAR023 Porsche Carrera GT Luxury 605 297 km/h $50,000 38.9
CAR024 Porsche 918 Spyder Classic 655 305 km/h $50,000 38.2
CAR025 Porsche Cayman GT4 Luxury 535 288 km/h $50,000 44.9
CAR026 Porsche Panamera Turbo Classic 699 307 km/h $50,000 41.1
CAR027 Porsche Taycan Turbo S Track Weapon 512 288 km/h $50,000 33.9
CAR028 Porsche 959 Classic 456 289 km/h $50,000 40.6
CAR029 Porsche Macan GTS Classic 432 304 km/h $50,000 40.8
CAR030 Porsche 911 Dakar Track Weapon 528 315 km/h $50,000 43.8
CAR031 McLaren P1 Supercar 658 354 km/h $50,000 48.8
CAR032 McLaren 720S Supercar 774 327 km/h $50,000 43.2
CAR033 McLaren Senna Supercar 832 320 km/h $50,000 51.6
CAR034 McLaren F1 Supercar 734 352 km/h $50,000 48.3
CAR035 McLaren Artura Supercar 654 360 km/h $50,000 49.3
CAR036 McLaren 570S Supercar 859 358 km/h $50,000 47.5
CAR037 McLaren Speedtail Supercar 682 354 km/h $50,000 47.1
CAR038 McLaren Elva Supercar 600 358 km/h $50,000 38.2
CAR039 McLaren 765LT Supercar 657 343 km/h $50,000 42.6
CAR040 McLaren 600LT Supercar 722 323 km/h $50,000 48.2
CAR041 Aston Martin Valkyrie Supercar 640 325 km/h $50,000 38.2
CAR042 Aston Martin DB11 Supercar 872 328 km/h $50,000 49.3
CAR043 Aston Martin DBS Superleggera Supercar 881 330 km/h $50,000 51.4
CAR044 Aston Martin Vantage Supercar 816 333 km/h $50,000 51.5
CAR045 Aston Martin One-77 Supercar 702 339 km/h $50,000 49.9
CAR046 Aston Martin Vulcan Supercar 932 343 km/h $50,000 52.4
CAR047 Aston Martin Valhalla Supercar 831 327 km/h $50,000 42.5
CAR048 Aston Martin DBX Supercar 773 321 km/h $50,000 42.8
CAR049 Aston Martin Vanquish Supercar 901 334 km/h $50,000 54.1
CAR050 Aston Martin Victor Supercar 923 323 km/h $50,000 44.3
CAR051 Bugatti Chiron Hypercar 1338 389 km/h $50,000 58.0
CAR052 Bugatti Veyron Hypercar 1497 407 km/h $50,000 67.4
CAR053 Bugatti Divo Hypercar 1584 453 km/h $50,000 66.0
CAR054 Bugatti Centodieci Hypercar 1416 404 km/h $50,000 66.2
CAR055 Bugatti Bolide Hypercar 1441 425 km/h $50,000 62.7
CAR056 Bugatti La Voiture Noire Hypercar 1055 466 km/h $50,000 59.3
CAR057 Bugatti EB110 Hypercar 1100 387 km/h $50,000 53.4
CAR058 Bugatti Mistral Hypercar 1111 411 km/h $50,000 58.2
CAR059 Bugatti Chiron Pur Sport Hypercar 1459 397 km/h $50,000 60.7
CAR060 Bugatti Veyron Super Sport Hypercar 1473 411 km/h $50,000 56.7
CAR061 Mercedes AMG GT Black Series Track Weapon 626 315 km/h $50,000 37.6
CAR062 Mercedes G63 AMG Classic 521 290 km/h $50,000 36.4
CAR063 Mercedes SLS AMG Track Weapon 605 283 km/h $50,000 42.5
CAR064 Mercedes Maybach S680 Classic 535 309 km/h $50,000 37.2
CAR065 Mercedes AMG One Track Weapon 497 298 km/h $50,000 42.5
CAR066 Mercedes SL65 AMG Black Track Weapon 677 283 km/h $50,000 36.6
CAR067 Mercedes CLK GTR JDM Legend 699 310 km/h $50,000 37.9
CAR068 Mercedes C63 AMG S Track Weapon 660 285 km/h $50,000 44.0
CAR069 Mercedes E63 AMG S JDM Legend 434 295 km/h $50,000 40.7
CAR070 Mercedes S65 AMG Luxury 420 319 km/h $50,000 37.5
CAR071 BMW M4 Competition Classic 504 300 km/h $50,000 36.5
CAR072 BMW M5 CS Track Weapon 553 309 km/h $50,000 35.4
CAR073 BMW M8 Gran Coupe Track Weapon 634 319 km/h $50,000 35.7
CAR074 BMW i8 JDM Legend 675 293 km/h $50,000 41.2
CAR075 BMW M2 CS JDM Legend 435 295 km/h $50,000 38.7
CAR076 BMW M3 Touring Track Weapon 678 299 km/h $50,000 47.2
CAR077 BMW X6 M Track Weapon 683 299 km/h $50,000 38.5
CAR078 BMW Z8 JDM Legend 535 287 km/h $50,000 37.6
CAR079 BMW M1 Luxury 544 318 km/h $50,000 37.7
CAR080 BMW 3.0 CSL Track Weapon 535 312 km/h $50,000 34.8
CAR081 Audi R8 V10 Plus Luxury 616 297 km/h $50,000 39.1
CAR082 Audi RS6 Avant Classic 534 290 km/h $50,000 41.9
CAR083 Audi RS7 JDM Legend 404 287 km/h $50,000 40.7
CAR084 Audi RS e-tron GT JDM Legend 418 303 km/h $50,000 38.1
CAR085 Audi RS3 Track Weapon 465 282 km/h $50,000 37.3
CAR086 Audi TT RS Luxury 507 295 km/h $50,000 41.6
CAR087 Audi RSQ8 JDM Legend 608 319 km/h $50,000 37.8
CAR088 Audi Sport Quattro Luxury 490 306 km/h $50,000 40.9
CAR089 Audi R8 RWD Track Weapon 527 297 km/h $50,000 41.2
CAR090 Audi RS5 Classic 419 310 km/h $50,000 37.1
CAR091 Nissan GT-R Nismo JDM Legend 556 294 km/h $50,000 41.6
CAR092 Nissan Skyline R34 GT-R Luxury 568 297 km/h $50,000 38.4
CAR093 Nissan Skyline R33 GT-R Luxury 660 305 km/h $50,000 36.8
CAR094 Nissan Skyline R32 GT-R Luxury 459 296 km/h $50,000 33.7
CAR095 Nissan 370Z Nismo Luxury 455 318 km/h $50,000 39.3
CAR096 Nissan 400Z JDM Legend 661 287 km/h $50,000 41.1
CAR097 Nissan Silvia S15 JDM Legend 422 307 km/h $50,000 37.5
CAR098 Nissan GT-R50 Luxury 620 284 km/h $50,000 43.1
CAR099 Nissan Juke-R Luxury 560 287 km/h $50,000 42.4
CAR100 Nissan Fairlady Z Luxury 558 306 km/h $50,000 43.5
`;

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

const lines = rawData.trim().split('\n');
const cars = lines.map(line => {
  // Regex to match CAR001 Ferrari F40 Supercar 927 327 km/h $50,000 48.5
  // Note: some car names have multiple words.
  // The structure is ID (CAR\d+) <Name> <Category (1-2 words)> <HP> <Speed> km/h <Price> <Score>
  
  const match = line.match(/(CAR\d+)\s+(.+?)\s+(Supercar|JDM Legend|Track Weapon|Classic|Luxury)\s+(\d+)\s+(\d+)\s+km\/h\s+(\$[0-9,]+)\s+([\d.]+)/);
  if (!match) {
    console.log("Failed to parse:", line);
    return null;
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
    auctionScore: Math.round(score * 20), // Scale score to match typical ~900 scale, e.g. 48.5 -> 970
    basePrice: 50 // Base price can be standard 50
  };
}).filter(c => c !== null);

const output = `import { Player } from '../types';

export const CAR_DATA: Player[] = ${JSON.stringify(cars, null, 2)};
`;

fs.writeFileSync('src/services/carData.ts', output);
console.log('carData.ts updated with ' + cars.length + ' cars.');
