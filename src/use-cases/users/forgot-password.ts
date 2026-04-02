import { IMailProvider } from '@/providers/mail/IMailProvider'
import { TokensRepository } from '@/repositories/tokens-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { forgotPasswordTemplate } from '@/providers/mail/templates/forgot-password'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface ForgotPasswordUseCaseRequest {
  email: string
}

export class ForgotPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokensRepository: TokensRepository,
    private mailProvider: IMailProvider
  ) {}

  async execute({ email }: ForgotPasswordUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    // Define expiration of 2 hours for password reset
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2)

    const resetToken = await this.tokensRepository.create({
      userId: user.id,
      type: 'PASSWORD_RESET',
      expiresAt,
    })

    await this.mailProvider.sendMail({
      to: user.email,
      subject: 'Recuperação de Senha',
      body: forgotPasswordTemplate({ name: user.name, token: resetToken.token }),
    })
  }
}
