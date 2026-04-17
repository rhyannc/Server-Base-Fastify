import { PrismaClient } from '@prisma/client'

export async function seedUsers(prisma: PrismaClient) {

// 🔹 Usuário 1 - Rhyann
await prisma.user.upsert({
  where: { email: 'rhyannc@hotmail.com' },
  update: {},
  create: {
    name: 'Rhyann Carvalhais',
    email: 'rhyannc@hotmail.com',
    phone: '31988223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    avatar:
      'https://media-bsb1-1.cdn.whatsapp.net/v/t61.24694-24/55935424_815640652136710_4082209373663789056_n.jpg?ccb=11-4&oh=01_Q5Aa4AEW4IDVBPoSM4yuNDjaJYY6yGcr6iPGSSh4RIb-ofIevg&oe=69DEC2D1&_nc_sid=5e03e0&_nc_cat=111',
    role: 'ADMIN',
  },
})

// 🔹 Usuário 2 - Max Verstappen
await prisma.user.upsert({
  where: { email: 'max@hotmail.com' },
  update: {},
  create: {
    name: 'Max Verstappen',
    email: 'max@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'ADMIN',
  },
})


await prisma.user.upsert({
  where: { email: 'nico@hotmail.com' },
  update: {},
  create: {
    name: 'Nico Rosberg',
    email: 'nico@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})


await prisma.user.upsert({
  where: { email: 'lauda@hotmail.com' },
  update: {},
  create: {
    name: 'Lauda',
    email: 'lauda@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})


await prisma.user.upsert({
  where: { email: 'massa@hotmail.com' },
  update: {},
  create: {
    name: 'Felipe Massa',
    email: 'massa@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})


await prisma.user.upsert({
  where: { email: 'piquet@hotmail.com' },
  update: {},
  create: {
    name: 'Nelson Piquet',
    email: 'piquet@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})


await prisma.user.upsert({
  where: { email: 'fittipaldi@hotmail.com' },
  update: {},
  create: {
    name: 'Emerson Fittipaldi',
    email: 'fittipaldi@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})


await prisma.user.upsert({
  where: { email: 'senna@hotmail.com' },
  update: {},
  create: {
    name: 'Ayrton Senna',
    email: 'senna@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})


await prisma.user.upsert({
  where: { email: 'barrichello@hotmail.com' },
  update: {},
  create: {
    name: 'Rubens Barrichello',
    email: 'barrichello@hotmail.com',
    phone: '31999223344',
    passwordHash:
      '$2b$04$x5nLRUhx49mPCCi2546f..8hBRWQ18sbBfjVXP1WY7ksfbG0dwrrS',
    role: 'USER',
  },
})

  
}