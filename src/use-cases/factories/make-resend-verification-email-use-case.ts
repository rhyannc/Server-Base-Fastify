import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'
import { EtherealMailProvider } from '@/providers/mail/implementations/EtherealMailProvider'
import { ResendMailProvider } from '@/providers/mail/implementations/ResendMailProvider'
import { env } from '@/env'
import { ResendVerificationEmailUseCase } from '../users/resend-verification-email'

export function makeResendVerificationEmailUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const tokensRepository = new PrismaTokensRepository()
  
  const mailProvider = env.NODE_ENV === 'production' 
    ? new ResendMailProvider() 
    : new EtherealMailProvider()

  const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
    usersRepository,
    tokensRepository,
    mailProvider
  )

  return resendVerificationEmailUseCase
}
