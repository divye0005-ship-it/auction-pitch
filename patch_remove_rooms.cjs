const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The block starts at `) : currentView === 'rooms' ? (`
// and ends somewhere before `) : currentView === 'profile' ? (`
content = content.replace(
  /\) : currentView === 'rooms' \? \([\s\S]*?\) : currentView === 'profile' \? \(/,
  ") : currentView === 'profile' ? ("
);

// We can also remove `import RoomsTab`
content = content.replace("import RoomsTab from './components/RoomsTab';\n", "");

fs.writeFileSync('src/App.tsx', content);
