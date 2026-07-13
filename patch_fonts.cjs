const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf-8');

content = content.replace(
  /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Anton&family=Inter:wght@400;700;900&family=JetBrains\+Mono:wght@400;700&display=swap'\);/,
  `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;700&display=swap');`
);

content = content.replace(/--font-display: "Anton", sans-serif;/, `--font-display: "Outfit", sans-serif;`);
content = content.replace(/--font-body: "Inter", sans-serif;/, `--font-body: "DM Sans", sans-serif;`);
content = content.replace(/--font-mono: "JetBrains Mono", monospace;/, `--font-mono: "Fira Code", monospace;`);

fs.writeFileSync('src/index.css', content);
console.log('Fonts updated.');
