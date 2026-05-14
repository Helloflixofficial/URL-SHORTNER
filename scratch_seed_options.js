const fs = require('fs');
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');

seed = seed.replace(
  /for \(const \[key, value\] of Object.entries\(defaultOptions\)\) {[\s\S]*?console.log\('✅ Default options seeded'\)/,
  `await prisma.option.deleteMany({})
  for (const [key, value] of Object.entries(defaultOptions)) {
    await prisma.option.create({
      data: { key, value },
    })
  }
  console.log('✅ Default options seeded')`
);

fs.writeFileSync('prisma/seed.ts', seed);
console.log("Seed options upsert replaced with delete+create.");
