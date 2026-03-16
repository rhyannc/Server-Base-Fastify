import { User } from '@prisma/client'
import { compare } from 'bcryptjs'

import { UsersRepository } from '@/repositories/users-repository'

import { InvalidCredentialsError } from './errors/invalid-credentials-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    // Confere email esta no BD
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    // Compara as senha usando o BCrypt
    const isPasswordCorrect = await compare(password, user.passwordHash)

    if (!isPasswordCorrect) {
      throw new InvalidCredentialsError()
    }

    // Atualiza a data do último login
    const updatedUser = await this.usersRepository.update({
      id: user.id,
      lastLoginAt: new Date(),
      updatedAt: user.updatedAt, // Nao altera o updatedAt, deixando apenas para quando o usuario for atualizado
    })

    return { user: updatedUser }
  }
}
