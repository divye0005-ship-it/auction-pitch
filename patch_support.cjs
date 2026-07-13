const fs = require('fs');
let content = fs.readFileSync('src/components/SupportTab.tsx', 'utf-8');

// Replace UPI ID
content = content.replace(/anmol_3505@ybl/g, "divye64@oksbi");
content = content.replace(/upi:\/\/pay\?pa=anmol_3505@ybl&pn=AuctionPitch&cu=INR/g, "upi://pay?pa=divye64@oksbi&pn=AuctionPitch&cu=INR");

// Wait, is there a QR Code image using anmol_3505@ybl? 
// Let's replace the whole URI to generate it.
content = content.replace(
  /https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=200x200&data=upi:\/\/pay\?pa=anmol_3505@ybl&pn=AuctionPitch&cu=INR/,
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=divye64@oksbi&pn=AuctionPitch&cu=INR"
);

fs.writeFileSync('src/components/SupportTab.tsx', content);
console.log('Support patched.');
