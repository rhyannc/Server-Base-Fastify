import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { SearchUserUseCase } from '../users/search-user'

export function makeSearchUserUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new SearchUserUseCase(usersRepository)

  return useCase
}
