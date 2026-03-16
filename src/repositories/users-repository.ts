import { Prisma, User } from '@prisma/client'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findMany(page: number): Promise<User[]>
  searchMany(query: string, page: number): Promise<User[]>
  create(data: Prisma.UserCreateInput): Promise<User>
  update(data: Prisma.UserUncheckedUpdateInput): Promise<User>
}
