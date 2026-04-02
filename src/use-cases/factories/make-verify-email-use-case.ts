import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'
import { VerifyEmailUseCase } from '../verify-email'

export function makeVerifyEmailUseCase() {
  const tokensRepository = new PrismaTokensRepository()
  const usersRepository = new PrismaUsersRepository()

  const verifyEmailUseCase = new VerifyEmailUseCase(
    tokensRepository,
    usersRepository
  )

  return verifyEmailUseCase
}
