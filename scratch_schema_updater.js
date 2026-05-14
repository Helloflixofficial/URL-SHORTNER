const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Change provider to mongodb
schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "mongodb"');

// 2. Change all id Int @id @default(autoincrement())
schema = schema.replace(/id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// 3. Change all foreign key fields
const fks = ['userId', 'linkId', 'campaignId', 'campaignUserId', 'campaignItemId', 'planId', 'referralId'];
for (const fk of fks) {
  // Optional relations
  schema = schema.replace(new RegExp(`\\b${fk}\\s+Int\\?`, 'g'), `${fk} String? @db.ObjectId`);
  // Required relations
  schema = schema.replace(new RegExp(`\\b${fk}\\s+Int\\b`, 'g'), `${fk} String @db.ObjectId`);
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Schema updated for MongoDB.");
