const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/@@index\(\[alias\]\)/g, '');
schema = schema.replace(/@@index\(\[key\]\)/g, '');
schema = schema.replace(/@@index\(\[token\]\)/g, '');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Duplicate indexes removed.");
