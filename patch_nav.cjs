const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const updated = content.replace(/currentView === 'play'/g, "currentView === 'home'")
                      .replace(/setCurrentView\('play'\)/g, "setCurrentView('home')")
                      .replace(/<span className="text-\[9px\] font-black uppercase tracking-widest">Play<\/span>/g, '<span className="text-[9px] font-black uppercase tracking-widest">Home</span>')
                      .replace(/<Play className="w-6 h-6" \/>/g, '<HomeIconLucide className="w-6 h-6" />');

fs.writeFileSync('src/App.tsx', updated);
console.log('Nav patched.');
