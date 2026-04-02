import { hash } from 'bcryptjs'
import { env } from '@/env'
import { TokensRepository } from '@/repositories/tokens-repository'
import { UsersRepository } from '@/repositories/users-repository'

interface ResetPasswordUseCaseRequest {
  token: string
  password: string
}

export class ResetPasswordUseCase {
  constructor(
    private tokensRepository: TokensRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({ token, password }: ResetPasswordUseCaseRequest): Promise<void> {
    const passwordToken = await this.tokensRepository.findByToken(token)

    if (!passwordToken) {
      throw new Error('Token de redefinição inválido.')
    }

    if (passwordToken.type !== 'PASSWORD_RESET') {
      throw new Error('Token inválido para esta operação.')
    }

    if (passwordToken.expiresAt < new Date()) {
      throw new Error('Token expirado. Solicite a redefinição de senha novamente.')
    }

    const user = await this.usersRepository.findById(passwordToken.userId)

    if (!user) {
      throw new Error('Usuário não encontrado.')
    }

    if (password.length < env.PASSWD_MIN_LENGTH || password.length > env.PASSWD_MAX_LENGTH) {
      throw new Error(`Senha deve ter pelo menos ${env.PASSWD_MIN_LENGTH} caracteres e máximo ${env.PASSWD_MAX_LENGTH}`)
    }

    const passwordHash = await hash(password, 4)

    await this.usersRepository.update({
      id: user.id,
      passwordHash,
    })

    // Apaga o token após o uso
    await this.tokensRepository.delete(passwordToken.id)
  }
}
