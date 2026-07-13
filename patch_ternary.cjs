const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<ProfileTab[\s\S]*?\/>\s*setJoinCode=\{setJoinCode\}[\s\S]*?isAdmin=\{user\?\.role === 'admin'\}\s*\/>/m;

content = content.replace(regex, `<ProfileTab
                user={user}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                onLogout={handleLogout}
              />`);

fs.writeFileSync('src/App.tsx', content);
