import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'
import { EtherealMailProvider } from '@/providers/mail/implementations/EtherealMailProvider'
import { ResendMailProvider } from '@/providers/mail/implementations/ResendMailProvider'
import { env } from '@/env'
import { ForgotPasswordUseCase } from '../users/forgot-password'

export function makeForgotPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const tokensRepository = new PrismaTokensRepository()
  
  const mailProvider = env.NODE_ENV === 'production' 
    ? new ResendMailProvider() 
    : new EtherealMailProvider()

  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    usersRepository,
    tokensRepository,
    mailProvider
  )

  return forgotPasswordUseCase
}
