import { PrismaClient } from '@prisma/client'
import { seedPlans } from './seeds/plan'
import { seedUsers } from './seeds/user'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Rodando seed...')

  await seedPlans(prisma)
  await seedUsers(prisma)

  console.log('✅ Seed finalizado!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })