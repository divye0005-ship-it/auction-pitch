const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/divye\.1@superyes%26pn=Divye%20Lalwani/g, "divye64@oksbi&pn=AuctionPitch&cu=INR");
content = content.replace(/divye\.1@superyes/g, "divye64@oksbi");

fs.writeFileSync('src/App.tsx', content);
console.log('UPI ID patched in App.tsx');
