import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'
import { ResetPasswordUseCase } from '../users/reset-password'

export function makeResetPasswordUseCase() {
  const tokensRepository = new PrismaTokensRepository()
  const usersRepository = new PrismaUsersRepository()

  const resetPasswordUseCase = new ResetPasswordUseCase(
    tokensRepository,
    usersRepository
  )

  return resetPasswordUseCase
}
