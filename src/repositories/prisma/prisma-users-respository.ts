import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { usersRepository } from '../users-respository'

export class PrismaUsersRepository implements usersRepository {
  async findbyEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }
}
