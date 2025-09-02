import { User } from '@prisma/client'
import { hash } from 'bcryptjs'

import { usersRepository } from '@/repositories/users-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface RegisterUseCaseRequest {
  name: string
  email: string
  phone?: string | null
  password: string
  plan?: string
  createdBy?: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private usersRepository: usersRepository) {}
  async execute({
    name,
    email,
    phone,
    password,
    plan,
    createdBy,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    // Crias Hash de senha usando o BCrypt
    const password_hash = await hash(password, 4)

    // Valida se email ja existe
    const userWithSameEmail = await this.usersRepository.findbyEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    // Cadastra no BD
    const user = await this.usersRepository.create({
      name,
      email,
      phone,
      password_hash,
      plan,
      createdBy,
    })

    return { user } // Retorna o usuário criado
  }
}
