import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { UpdateUserUseCase } from '../update-user'

export function makeUpdateUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateUserUseCase(usersRepository)

  return useCase
}
