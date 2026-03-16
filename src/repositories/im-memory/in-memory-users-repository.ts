import { Prisma, User } from '@prisma/client'

import { UsersRepository } from '@/repositories/users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async findMany(page: number) {
    return this.items.slice((page - 1) * 20, page * 20)
  }

  async searchMany(query: string, page: number) {
    return this.items
      .filter(
        (item) => item.name.includes(query) || item.email.includes(query),
      )
      .slice((page - 1) * 20, page * 20)
  }

  async update(data: Prisma.UserUncheckedUpdateInput) {
    const userIndex = this.items.findIndex((item) => item.id === data.id)

    if (userIndex >= 0) {
      if (data.name !== undefined) this.items[userIndex].name = data.name as string
      if (data.email !== undefined) this.items[userIndex].email = data.email as string
      if (data.phone !== undefined) this.items[userIndex].phone = data.phone as string | null
      if (data.passwordHash !== undefined) this.items[userIndex].passwordHash = data.passwordHash as string
      if (data.avatar !== undefined) this.items[userIndex].avatar = data.avatar as string | null
      if (data.active !== undefined) this.items[userIndex].active = data.active as boolean
      if (data.role !== undefined) this.items[userIndex].role = data.role as any
      if (data.lastLoginAt !== undefined) this.items[userIndex].lastLoginAt = data.lastLoginAt as Date | null
      if (data.updatedAt !== undefined) this.items[userIndex].updatedAt = data.updatedAt as Date
    }

    return this.items[userIndex]
  }

  async create(data: Prisma.UserCreateInput) {
    const user: User = {
      id: 'user-1',
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      passwordHash: data.passwordHash,
      avatar: null,
      active: true,
      role: 'MEMBER',
      lastLoginAt: new Date(),
      createdBy: 'user-0',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(user)

    return user
  }
}
