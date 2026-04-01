import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { UpdateUserProfileUseCase } from '../users/update-user-profile'

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateUserProfileUseCase(usersRepository)

  return useCase
}
