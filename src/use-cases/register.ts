import { User } from '@prisma/client'
import { hash } from 'bcryptjs'

import { UsersRepository } from '@/repositories/users-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface RegisterUseCaseRequest {
  name: string
  email: string
  phone?: string | null
  password: string
  createdBy?: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}
  async execute({
    name,
    email,
    phone,
    password,
    createdBy,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
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

    return { user } // Retorna o usuário criado
  }
}
