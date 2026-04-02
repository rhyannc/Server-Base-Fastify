import { TokensRepository } from '@/repositories/tokens-repository'
import { UsersRepository } from '@/repositories/users-repository'

interface VerifyEmailUseCaseRequest {
  token: string
}

export class VerifyEmailUseCase {
  constructor(
    private tokensRepository: TokensRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({ token }: VerifyEmailUseCaseRequest): Promise<void> {
    const verificationToken = await this.tokensRepository.findByToken(token)

    if (!verificationToken) {
      throw new Error('Token de verificação inválido.')
    }

    if (verificationToken.type !== 'EMAIL_VERIFICATION') {
      throw new Error('Token inválido para esta operação.')
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new Error('Token expirado.')
    }

    const user = await this.usersRepository.findById(verificationToken.userId)

    if (!user) {
      throw new Error('Usuário não encontrado.')
    }

    // Marca o usuário como verificado
    // Como não há 'emailVerified' no schema ainda, podemos setar active = true
    // (Apesar de já vir como true por padrão)
    // await this.usersRepository.update(user.id, { active: true })

    // E deleta o token
    await this.tokensRepository.delete(verificationToken.id)
  }
}
