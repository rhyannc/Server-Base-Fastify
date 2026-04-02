import { IMailProvider } from '@/providers/mail/IMailProvider'
import { TokensRepository } from '@/repositories/tokens-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { verifyEmailTemplate } from '@/providers/mail/templates/verify-email'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface ResendVerificationEmailUseCaseRequest {
  email: string
}

export class ResendVerificationEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokensRepository: TokensRepository,
    private mailProvider: IMailProvider
  ) {}

  async execute({ email }: ResendVerificationEmailUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const verificationToken = await this.tokensRepository.create({
      userId: user.id,
      type: 'EMAIL_VERIFICATION',
      expiresAt,
    })

    await this.mailProvider.sendMail({
      to: user.email,
      subject: 'Reenvio: Verifique seu e-mail do SaaS',
      body: verifyEmailTemplate({ name: user.name, token: verificationToken.token, isResend: true }),
    })
  }
}
