import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { GetUserIdUseCase } from '../users/get-user-id'

export function makeGetUserIdUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new GetUserIdUseCase(usersRepository)

  return useCase
}
