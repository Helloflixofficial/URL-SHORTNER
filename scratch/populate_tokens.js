const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')

async function main() {
  const users = await prisma.user.findMany({
    where: { apiToken: null }
  })
  console.log(`Found ${users.length} users without tokens`)
  
  for (const user of users) {
    const token = crypto.randomBytes(16).toString('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: { apiToken: token }
    })
    console.log(`Generated token for ${user.username}`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
