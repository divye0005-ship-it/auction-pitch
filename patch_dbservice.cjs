const fs = require('fs');
let content = fs.readFileSync('src/services/dbService.ts', 'utf-8');
content = content.replace(/category,\n      title: \`\$\{category\.toUpperCase\(\)\} Match\`,/, "category: category as any,\n      title: `${category.toUpperCase()} Match`,");
fs.writeFileSync('src/services/dbService.ts', content);
