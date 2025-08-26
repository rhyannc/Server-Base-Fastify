import { Prisma, User } from '@prisma/client'

export interface usersRepository {
  findbyEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
}
