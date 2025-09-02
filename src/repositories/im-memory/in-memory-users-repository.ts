import { Prisma, User } from '@prisma/client'

import { usersRepository } from '@/repositories/users-repository'

export class InMemoryUsersRepository implements usersRepository {
  public items: User[] = []

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async findbyEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = {
      id: 'user-1',
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      password_hash: data.password_hash,
      active: true,
      plan: data.plan ?? 'free',
      planExpiresAt: new Date(),
      role: data.role ?? 'MEMBER',
      lastLoginAt: new Date(),
      createdBy: 'user-0',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(user)

    return user
  }
}
