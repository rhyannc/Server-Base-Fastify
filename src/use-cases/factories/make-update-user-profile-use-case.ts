import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { UpdateUserProfileUseCase } from '../update-user-profile'

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateUserProfileUseCase(usersRepository)

  return useCase
}
