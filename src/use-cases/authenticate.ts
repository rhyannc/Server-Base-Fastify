import { User } from '@prisma/client'
import { compare } from 'bcryptjs'

import { UsersRepository } from '@/repositories/users-repository'

import { ActivityLogsRepository } from '@/repositories/activity-logs-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
  ip?: string
  userAgent?: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private activityLogsRepository: ActivityLogsRepository,
  ) {}

  async execute({
    email,
    password,
    ip,
    userAgent,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    // Confere email esta no BD
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      await this.activityLogsRepository.create({
        action: 'LOGIN_FAILURE',
        resource: 'USER',
        description: `Tentativa de login com email inexistente: ${email}`,
        ip,
        userAgent,
      })
      throw new InvalidCredentialsError()
    }

    // Compara as senha usando o BCrypt
    const isPasswordCorrect = await compare(password, user.passwordHash)

    if (!isPasswordCorrect) {
      await this.activityLogsRepository.create({
        userId: user.id,
        action: 'LOGIN_FAILURE',
        resource: 'USER',
        description: `Senha incorreta para o usuário: ${email}`,
        ip,
        userAgent,
      })
      throw new InvalidCredentialsError()
    }

    // Atualiza a data do último login
    const updatedUser = await this.usersRepository.update({
      id: user.id,
      lastLoginAt: new Date(),
      updatedAt: user.updatedAt, // Nao altera o updatedAt, deixando apenas para quando o usuario for atualizado
    })

    // Registra o login no log de atividades
   await this.activityLogsRepository.create({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: 'USER',
      description: `Usuário ${email} autenticado com sucesso.`,
      ip,
      userAgent,
    })

    return { user: updatedUser }
  } 
}
