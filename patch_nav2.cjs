const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /<button \n\s*onClick=\{\(\) => setCurrentView\('rooms'\)\}[\s\S]*?<span className="text-\[9px\] font-black uppercase tracking-widest">Rooms<\/span>\n\s*<\/button>/,
  ""
);

fs.writeFileSync('src/App.tsx', content);
