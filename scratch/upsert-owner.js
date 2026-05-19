const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'shboby71@gmail.com';
  const password = await bcrypt.hash('786@Password', 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'owner',
      password: password,
      status: 'active'
    },
    create: {
      username: 'shboby',
      email: email,
      password: password,
      role: 'owner',
      status: 'active',
      balance: 0
    }
  });
  console.log('Owner user configured:', user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
