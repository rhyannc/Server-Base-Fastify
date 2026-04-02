import { User } from '@prisma/client'
import { hash } from 'bcryptjs'

import { env } from '@/env'

import { UsersRepository } from '@/repositories/users-repository'
import { TokensRepository } from '@/repositories/tokens-repository'
import { IMailProvider } from '@/providers/mail/IMailProvider'
import { verifyEmailTemplate } from '@/providers/mail/templates/verify-email'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface RegisterUseCaseRequest {
  name: string
  email: string
  phone?: string | null
  password: string
  createdBy?: string | null
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokensRepository: TokensRepository,
    private mailProvider: IMailProvider
  ) {}
  async execute({
    name,
    email,
    phone,
    password,
    createdBy,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {

    // Valida char senha
    if (password.length < env.PASSWD_MIN_LENGTH || password.length > env.PASSWD_MAX_LENGTH) {
      throw new Error(`Senha deve ter pelo menos ${env.PASSWD_MIN_LENGTH} caracteres e máximo ${env.PASSWD_MAX_LENGTH}`)
    }

    // Crias Hash de senha usando o BCrypt
    const passwordHash = await hash(password, 4)

    // Valida se email ja existe
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    // Cadastra no BD
    const user = await this.usersRepository.create({
      name,
      email,
      phone,
      passwordHash,
      createdBy,
    })

    // Gera o token de verificação (expira em 24 horas)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const verificationToken = await this.tokensRepository.create({
      userId: user.id,
      type: 'EMAIL_VERIFICATION',
      expiresAt,
    })

    // Envia o e-mail de verificação
    await this.mailProvider.sendMail({
      to: user.email,
      subject: 'Bem-vindo ao SaaS! Verifique seu e-mail',
      body: verifyEmailTemplate({ name: user.name, token: verificationToken.token }),
    })

    return { user } // Retorna o usuário criado
  }
}
