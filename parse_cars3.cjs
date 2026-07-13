const fs = require('fs');

const rawText = `
CAR001 Ferrari F40 Supercar 927 327 km/h $50,000 48.5 Ferrari F40 cinematic studio light dark background 8k
CAR002 Ferrari 458 Italia Supercar 725 334 km/h $50,000 40.5 Ferrari 458 Italia cinematic studio light dark background 8k
CAR003 Ferrari LaFerrari Supercar 946 354 km/h $50,000 51.2 Ferrari LaFerrari cinematic studio light dark background 8k
CAR004 Ferrari 812 Superfast Supercar 616 321 km/h $50,000 40.1 Ferrari 812 Superfast cinematic studio light dark background 8k
CAR005 Ferrari SF90 Stradale Supercar 858 358 km/h $50,000 45.6 Ferrari SF90 Stradale cinematic studio light dark background 8k
CAR006 Ferrari Enzo Supercar 932 354 km/h $50,000 50.6 Ferrari Enzo cinematic studio light dark background 8k
CAR007 Ferrari F8 Tributo Supercar 901 337 km/h $50,000 43.4 Ferrari F8 Tributo cinematic studio light dark background 8k
CAR008 Ferrari Roma Supercar 681 347 km/h $50,000 41.6 Ferrari Roma cinematic studio light dark background 8k
CAR009 Ferrari Portofino Supercar 710 341 km/h $50,000 46.3 Ferrari Portofino cinematic studio light dark background 8k
CAR010 Ferrari 250 GTO Supercar 649 342 km/h $50,000 46.5 Ferrari 250 GTO cinematic studio light dark background 8k
CAR011 Lamborghini Aventador SVJ Supercar 735 322 km/h $50,000 48.0 Lamborghini Aventador SVJ cinematic studio light dark background 8k
CAR012 Lamborghini Huracan Performante Supercar 663 344 km/h $50,000 43.5 Lamborghini Huracan Performante cinematic studio light dark background 8k
CAR013 Lamborghini Urus Supercar 921 359 km/h $50,000 48.2 Lamborghini Urus cinematic studio light dark background 8k
CAR014 Lamborghini Murcielago Supercar 895 332 km/h $50,000 43.4 Lamborghini Murcielago cinematic studio light dark background 8k
CAR015 Lamborghini Gallardo Supercar 938 334 km/h $50,000 44.1 Lamborghini Gallardo cinematic studio light dark background 8k
CAR016 Lamborghini Sian Supercar 719 326 km/h $50,000 46.1 Lamborghini Sian cinematic studio light dark background 8k
CAR017 Lamborghini Centenario Supercar 925 343 km/h $50,000 48.6 Lamborghini Centenario cinematic studio light dark background 8k
CAR018 Lamborghini Diablo Supercar 707 337 km/h $50,000 49.7 Lamborghini Diablo cinematic studio light dark background 8k
CAR019 Lamborghini Countach Supercar 931 324 km/h $50,000 46.0 Lamborghini Countach cinematic studio light dark background 8k
CAR020 Lamborghini Veneno Supercar 873 335 km/h $50,000 49.4 Lamborghini Veneno cinematic studio light dark background 8k
CAR021 Porsche 911 GT3 RS JDM Legend 538 320 km/h $50,000 44.6 Porsche 911 GT3 RS cinematic studio light dark background 8k
CAR022 Porsche 911 Turbo S Track Weapon 566 283 km/h $50,000 39.6 Porsche 911 Turbo S cinematic studio light dark background 8k
CAR023 Porsche Carrera GT Luxury 605 297 km/h $50,000 38.9 Porsche Carrera GT cinematic studio light dark background 8k
CAR024 Porsche 918 Spyder Classic 655 305 km/h $50,000 38.2 Porsche 918 Spyder cinematic studio light dark background 8k
CAR025 Porsche Cayman GT4 Luxury 535 288 km/h $50,000 44.9 Porsche Cayman GT4 cinematic studio light dark background 8k
CAR026 Porsche Panamera Turbo Classic 699 307 km/h $50,000 41.1 Porsche Panamera Turbo cinematic studio light dark background 8k
CAR027 Porsche Taycan Turbo S Track Weapon 512 288 km/h $50,000 33.9 Porsche Taycan Turbo S cinematic studio light dark background 8k
CAR028 Porsche 959 Classic 456 289 km/h $50,000 40.6 Porsche 959 cinematic studio light dark background 8k
CAR029 Porsche Macan GTS Classic 432 304 km/h $50,000 40.8 Porsche Macan GTS cinematic studio light dark background 8k
CAR030 Porsche 911 Dakar Track Weapon 528 315 km/h $50,000 43.8 Porsche 911 Dakar cinematic studio light dark background 8k
CAR031 McLaren P1 Supercar 658 354 km/h $50,000 48.8 McLaren P1 cinematic studio light dark background 8k
CAR032 McLaren 720S Supercar 774 327 km/h $50,000 43.2 McLaren 720S cinematic studio light dark background 8k
CAR033 McLaren Senna Supercar 832 320 km/h $50,000 51.6 McLaren Senna cinematic studio light dark background 8k
CAR034 McLaren F1 Supercar 734 352 km/h $50,000 48.3 McLaren F1 cinematic studio light dark background 8k
CAR035 McLaren Artura Supercar 654 360 km/h $50,000 49.3 McLaren Artura cinematic studio light dark background 8k
CAR036 McLaren 570S Supercar 859 358 km/h $50,000 47.5 McLaren 570S cinematic studio light dark background 8k
CAR037 McLaren Speedtail Supercar 682 354 km/h $50,000 47.1 McLaren Speedtail cinematic studio light dark background 8k
CAR038 McLaren Elva Supercar 600 358 km/h $50,000 38.2 McLaren Elva cinematic studio light dark background 8k
CAR039 McLaren 765LT Supercar 657 343 km/h $50,000 42.6 McLaren 765LT cinematic studio light dark background 8k
CAR040 McLaren 600LT Supercar 722 323 km/h $50,000 48.2 McLaren 600LT cinematic studio light dark background 8k
CAR041 Aston Martin Valkyrie Supercar 640 325 km/h $50,000 38.2 Aston Martin Valkyrie cinematic studio light dark background 8k
CAR042 Aston Martin DB11 Supercar 872 328 km/h $50,000 49.3 Aston Martin DB11 cinematic studio light dark background 8k
CAR043 Aston Martin DBS Superleggera Supercar 881 330 km/h $50,000 51.4 Aston Martin DBS Superleggera cinematic studio light dark background 8k
CAR044 Aston Martin Vantage Supercar 816 333 km/h $50,000 51.5 Aston Martin Vantage cinematic studio light dark background 8k
CAR045 Aston Martin One-77 Supercar 702 339 km/h $50,000 49.9 Aston Martin One-77 cinematic studio light dark background 8k
CAR046 Aston Martin Vulcan Supercar 932 343 km/h $50,000 52.4 Aston Martin Vulcan cinematic studio light dark background 8k
CAR047 Aston Martin Valhalla Supercar 831 327 km/h $50,000 42.5 Aston Martin Valhalla cinematic studio light dark background 8k
CAR048 Aston Martin DBX Supercar 773 321 km/h $50,000 42.8 Aston Martin DBX cinematic studio light dark background 8k
CAR049 Aston Martin Vanquish Supercar 901 334 km/h $50,000 54.1 Aston Martin Vanquish cinematic studio light dark background 8k
CAR050 Aston Martin Victor Supercar 923 323 km/h $50,000 44.3 Aston Martin Victor cinematic studio light dark background 8k
CAR051 Bugatti Chiron Hypercar 1338 389 km/h $50,000 58.0 Bugatti Chiron cinematic studio light dark background 8k
CAR052 Bugatti Veyron Hypercar 1497 407 km/h $50,000 67.4 Bugatti Veyron cinematic studio light dark background 8k
CAR053 Bugatti Divo Hypercar 1584 453 km/h $50,000 66.0 Bugatti Divo cinematic studio light dark background 8k
CAR054 Bugatti Centodieci Hypercar 1416 404 km/h $50,000 66.2 Bugatti Centodieci cinematic studio light dark background 8k
CAR055 Bugatti Bolide Hypercar 1441 425 km/h $50,000 62.7 Bugatti Bolide cinematic studio light dark background 8k
CAR056 Bugatti La Voiture Noire Hypercar 1055 466 km/h $50,000 59.3 Bugatti La Voiture Noire cinematic studio light dark background 8k
CAR057 Bugatti EB110 Hypercar 1100 387 km/h $50,000 53.4 Bugatti EB110 cinematic studio light dark background 8k
CAR058 Bugatti Mistral Hypercar 1111 411 km/h $50,000 58.2 Bugatti Mistral cinematic studio light dark background 8k
CAR059 Bugatti Chiron Pur Sport Hypercar 1459 397 km/h $50,000 60.7 Bugatti Chiron Pur Sport cinematic studio light dark background 8k
CAR060 Bugatti Veyron Super Sport Hypercar 1473 411 km/h $50,000 56.7 Bugatti Veyron Super Sport cinematic studio light dark background 8k
CAR061 Mercedes AMG GT Black Series Track Weapon 626 315 km/h $50,000 37.6 Mercedes AMG GT Black Series cinematic studio light dark background 8k
CAR062 Mercedes G63 AMG Classic 521 290 km/h $50,000 36.4 Mercedes G63 AMG cinematic studio light dark background 8k
CAR063 Mercedes SLS AMG Track Weapon 605 283 km/h $50,000 42.5 Mercedes SLS AMG cinematic studio light dark background 8k
CAR064 Mercedes Maybach S680 Classic 535 309 km/h $50,000 37.2 Mercedes Maybach S680 cinematic studio light dark background 8k
CAR065 Mercedes AMG One Track Weapon 497 298 km/h $50,000 42.5 Mercedes AMG One cinematic studio light dark background 8k
CAR066 Mercedes SL65 AMG Black Track Weapon 677 283 km/h $50,000 36.6 Mercedes SL65 AMG Black cinematic studio light dark background 8k
CAR067 Mercedes CLK GTR JDM Legend 699 310 km/h $50,000 37.9 Mercedes CLK GTR cinematic studio light dark background 8k
CAR068 Mercedes C63 AMG S Track Weapon 660 285 km/h $50,000 44.0 Mercedes C63 AMG S cinematic studio light dark background 8k
CAR069 Mercedes E63 AMG S JDM Legend 434 295 km/h $50,000 40.7 Mercedes E63 AMG S cinematic studio light dark background 8k
CAR070 Mercedes S65 AMG Luxury 420 319 km/h $50,000 37.5 Mercedes S65 AMG cinematic studio light dark background 8k
CAR071 BMW M4 Competition Classic 504 300 km/h $50,000 36.5 BMW M4 Competition cinematic studio light dark background 8k
CAR072 BMW M5 CS Track Weapon 553 309 km/h $50,000 35.4 BMW M5 CS cinematic studio light dark background 8k
CAR073 BMW M8 Gran Coupe Track Weapon 634 319 km/h $50,000 35.7 BMW M8 Gran Coupe cinematic studio light dark background 8k
CAR074 BMW i8 JDM Legend 675 293 km/h $50,000 41.2 BMW i8 cinematic studio light dark background 8k
CAR075 BMW M2 CS JDM Legend 435 295 km/h $50,000 38.7 BMW M2 CS cinematic studio light dark background 8k
CAR076 BMW M3 Touring Track Weapon 678 299 km/h $50,000 47.2 BMW M3 Touring cinematic studio light dark background 8k
CAR077 BMW X6 M Track Weapon 683 299 km/h $50,000 38.5 BMW X6 M cinematic studio light dark background 8k
CAR078 BMW Z8 JDM Legend 535 287 km/h $50,000 37.6 BMW Z8 cinematic studio light dark background 8k
CAR079 BMW M1 Luxury 544 318 km/h $50,000 37.7 BMW M1 cinematic studio light dark background 8k
CAR080 BMW 3.0 CSL Track Weapon 535 312 km/h $50,000 34.8 BMW 3.0 CSL cinematic studio light dark background 8k
CAR081 Audi R8 V10 Plus Luxury 616 297 km/h $50,000 39.1 Audi R8 V10 Plus cinematic studio light dark background 8k
CAR082 Audi RS6 Avant Classic 534 290 km/h $50,000 41.9 Audi RS6 Avant cinematic studio light dark background 8k
CAR083 Audi RS7 JDM Legend 404 287 km/h $50,000 40.7 Audi RS7 cinematic studio light dark background 8k
CAR084 Audi RS e-tron GT JDM Legend 418 303 km/h $50,000 38.1 Audi RS e-tron GT cinematic studio light dark background 8k
CAR085 Audi RS3 Track Weapon 465 282 km/h $50,000 37.3 Audi RS3 cinematic studio light dark background 8k
CAR086 Audi TT RS Luxury 507 295 km/h $50,000 41.6 Audi TT RS cinematic studio light dark background 8k
CAR087 Audi RSQ8 JDM Legend 608 319 km/h $50,000 37.8 Audi RSQ8 cinematic studio light dark background 8k
CAR088 Audi Sport Quattro Luxury 490 306 km/h $50,000 40.9 Audi Sport Quattro cinematic studio light dark background 8k
CAR089 Audi R8 RWD Track Weapon 527 297 km/h $50,000 41.2 Audi R8 RWD cinematic studio light dark background 8k
CAR090 Audi RS5 Classic 419 310 km/h $50,000 37.1 Audi RS5 cinematic studio light dark background 8k
CAR091 Nissan GT-R Nismo JDM Legend 556 294 km/h $50,000 41.6 Nissan GT-R Nismo cinematic studio light dark background 8k
CAR092 Nissan Skyline R34 GT-R Luxury 568 297 km/h $50,000 38.4 Nissan Skyline R34 GT-R cinematic studio light dark background 8k
CAR093 Nissan Skyline R33 GT-R Luxury 660 305 km/h $50,000 36.8 Nissan Skyline R33 GT-R cinematic studio light dark background 8k
CAR094 Nissan Skyline R32 GT-R Luxury 459 296 km/h $50,000 33.7 Nissan Skyline R32 GT-R cinematic studio light dark background 8k
CAR095 Nissan 370Z Nismo Luxury 455 318 km/h $50,000 39.3 Nissan 370Z Nismo cinematic studio light dark background 8k
CAR096 Nissan 400Z JDM Legend 661 287 km/h $50,000 41.1 Nissan 400Z cinematic studio light dark background 8k
CAR097 Nissan Silvia S15 JDM Legend 422 307 km/h $50,000 37.5 Nissan Silvia S15 cinematic studio light dark background 8k
CAR098 Nissan GT-R50 Luxury 620 284 km/h $50,000 43.1 Nissan GT-R50 cinematic studio light dark background 8k
CAR099 Nissan Juke-R Luxury 560 287 km/h $50,000 42.4 Nissan Juke-R cinematic studio light dark background 8k
CAR100 Nissan Fairlady Z Luxury 558 306 km/h $50,000 43.5 Nissan Fairlady Z cinematic studio light dark background 8k
`;

const lines = rawText.trim().split('\n');
const cars = lines.map(line => {
  const match = line.match(/(CAR\d+)\s+(.+?)\s+(Supercar|Hypercar|JDM Legend|Track Weapon|Classic|Luxury)\s+(\d+)\s+(\d+)\s+km\/h\s+(\$[0-9,]+)\s+([\d.]+)/);
  if (!match) {
    const parts = line.split(/\s+/);
    const id = parts[0];
    // Find the score, price, top speed, hp by going backwards
    const score = parts[parts.length - 1]; // Actually the last part of prompt might be "8k"
    
    // Let's use a better regex
    // We can just rely on "$50,000" as the separator.
    let priceIndex = parts.findIndex(p => p.startsWith('$'));
    if (priceIndex === -1) return null;
    
    const priceStr = parts[priceIndex];
    const topSpeed = parts[priceIndex - 2];
    const hp = parts[priceIndex - 3];
    const scoreVal = parts[priceIndex + 1];
    
    const roleMatch = line.match(/(Supercar|Hypercar|JDM Legend|Track Weapon|Classic|Luxury)/);
    const category = roleMatch ? roleMatch[1] : 'Supercar';
    
    const nameStr = line.substring(line.indexOf(id) + id.length, line.indexOf(category)).trim();
    const brand = nameStr.split(' ')[0];
    const promptMatch = line.substring(line.indexOf(scoreVal) + scoreVal.length).trim();
    
    return {
      playerId: id.toLowerCase(),
      name: nameStr,
      team: brand,
      role: category,
      photoUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(promptMatch)}?width=800&height=1200&nologo=true`,
      country: brand,
      stats: { hp: parseInt(hp, 10), topSpeed: parseInt(topSpeed, 10), value: priceStr },
      auctionScore: Math.round(parseFloat(scoreVal) * 20),
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
  const promptMatch = line.substring(line.indexOf(match[7]) + match[7].length).trim();
  
  return {
    playerId: id.toLowerCase(),
    name: name,
    team: brand,
    role: category,
    photoUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(promptMatch)}?width=800&height=1200&nologo=true`,
    country: brand,
    stats: { hp, topSpeed, value: priceStr },
    auctionScore: Math.round(score * 20),
    basePrice: 50
  };
}).filter(Boolean);

const output = `import { Player } from '../types';

export const CAR_DATA: Player[] = ${JSON.stringify(cars, null, 2)};
`;

fs.writeFileSync('src/services/carData.ts', output);
console.log('carData.ts rebuilt exactly matching PDF.');
