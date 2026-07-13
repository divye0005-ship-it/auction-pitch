const fs = require('fs');
let content = fs.readFileSync('src/components/HomeTab.tsx', 'utf-8');

// The IPL card has a custom SVG I just added previously. Let's replace it with a more cricket-like logo (maybe a bat and ball).
const cricketSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="m16 8-4-4-10 10 4 4 10-10Z" /><path d="M12 12 8 8" /><circle cx="18" cy="18" r="2" fill="currentColor" /></svg>`;

// The Car card uses <Car className="w-8 h-8 text-white" />. Let's enhance it.
const carSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2" fill="currentColor"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2" fill="currentColor"/></svg>`;

// Replace IPL logo
content = content.replace(
  /<svg viewBox="0 0 24 24"[^>]*>[\s\S]*?<\/svg>/,
  cricketSVG
);

content = content.replace(
  /<Car className="w-8 h-8 text-white" \/>/,
  carSVG
);

content = content.replace(
  /<HomeIcon className="w-8 h-8 text-white\/70" \/>/,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white/70"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
);

fs.writeFileSync('src/components/HomeTab.tsx', content);
console.log('Logos patched.');
