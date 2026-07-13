const fs = require('fs');
const path = require('path');
const https = require('https');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY_HERE';
const OUTPUT_DIR = path.join(__dirname, 'public/cars');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
}

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
  const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!response.ok) throw new Error('Pexels API failed');
  const data = await response.json();
  if (data.photos && data.photos.length > 0) return data.photos[0].src.large2x || data.photos[0].src.large;
  return null;
}

async function run() {
  console.log('Starting car image download script...');
  if (PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
    console.warn('WARNING: Please provide a valid PEXELS_API_KEY to fetch real images.');
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const cars = [
    { id: "CAR001", name: "Ferrari F40" }
    // ... load your cars here
  ];

  for (const car of cars) {
    try {
      const imageUrl = await searchPexels(car.name + ' car luxury');
      if (imageUrl) {
        const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
        const filename = `${car.id.toLowerCase()}${ext}`;
        await downloadImage(imageUrl, path.join(OUTPUT_DIR, filename));
        console.log(`Saved ${filename}`);
      }
    } catch (e) {
      console.error(`Failed ${car.name}:`, e.message);
    }
  }
}
run();
