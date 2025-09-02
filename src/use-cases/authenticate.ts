import { User } from '@prisma/client'
import { compare } from 'bcryptjs'

import { usersRepository } from '@/repositories/users-repository'

import { InvalidCredentialsError } from './errors/invalid-credentials-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(private usersRepository: usersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    // Confere email esta no BD
    const user = await this.usersRepository.findbyEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    // Compara as senha usando o BCrypt
    const isPasswordCorrect = await compare(password, user.password_hash)

    if (!isPasswordCorrect) {
      throw new InvalidCredentialsError()
    }

    return { user }
  }
}
