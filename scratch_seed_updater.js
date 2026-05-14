const fs = require('fs');
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');

seed = seed.replace(/where: { id: 1 }/g, "where: { id: '000000000000000000000010' }");
seed = seed.replace(/create: {/g, "create: {\n      id: '000000000000000000000010',").replace(
  /create: {\n      id: '000000000000000000000010',\n      name: 'Free'/,
  "create: {\n      id: '000000000000000000000010',\n      name: 'Free'"
);
// It's cleaner to just do string replacements one by one

seed = seed.replace("where: { id: 1 },", "where: { id: '000000000000000000000010' },");
seed = seed.replace("name: 'Free',", "id: '000000000000000000000010',\n      name: 'Free',");

seed = seed.replace("where: { id: 2 },", "where: { id: '000000000000000000000011' },");
seed = seed.replace("name: 'Pro',", "id: '000000000000000000000011',\n      name: 'Pro',");

seed = seed.replace("where: { id: 3 },", "where: { id: '000000000000000000000012' },");
seed = seed.replace("name: 'Elite',", "id: '000000000000000000000012',\n      name: 'Elite',");

seed = seed.replace("username: 'anonymous',", "id: '000000000000000000000001',\n      username: 'anonymous',");

fs.writeFileSync('prisma/seed.ts', seed);
console.log("Seed updated for MongoDB.");
