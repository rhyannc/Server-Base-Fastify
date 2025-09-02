import { Prisma, User } from '@prisma/client'

export interface usersRepository {
  findById(id: string): Promise<User | null>
  findbyEmail(email: string): Promise<User | null>
  searchMany(query: string, page: number): Promise<User[]>
  create(data: Prisma.UserCreateInput): Promise<User>
}
