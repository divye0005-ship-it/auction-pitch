const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  "<HomeTab \n                user={user!}\n                setRoom={setRoom}\n                setCurrentView={setCurrentView}\n              />",
  "<HomeTab \n                user={user!}\n                setRoom={setRoom}\n                setCurrentView={setCurrentView}\n                handleCreateRoom={handleCreateRoom}\n                handlePlaySolo={handlePlaySolo}\n              />"
);

fs.writeFileSync('src/App.tsx', content);
console.log('App props patched.');
