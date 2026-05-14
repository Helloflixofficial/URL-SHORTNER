const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/,\s*onDelete:\s*Cascade/g, '');

// Also fix self relation on User
schema = schema.replace(
  /referrer\s+User\?\s+@relation\("Referrals",\s*fields:\s*\[referralId\],\s*references:\s*\[id\]\)/,
  'referrer User? @relation("Referrals", fields: [referralId], references: [id], onDelete: NoAction, onUpdate: NoAction)'
);

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Cascades removed.");
