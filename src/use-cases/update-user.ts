import { Role, User } from '@prisma/client'
import { hash } from 'bcryptjs'

import { UsersRepository } from '@/repositories/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdateUserUseCaseRequest {
  id: string
  name?: string
  email?: string
  phone?: string | null
  password?: string
  avatar?: string | null
  active?: boolean
  role?: Role
}

interface UpdateUserUseCaseResponse {
  user: User
}

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}
  async execute({
    id,
    name,
    email,
    phone,
    password,
    avatar,
    active,
    role,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    // Confere se o usuário existe
    const userExists = await this.usersRepository.findById(id)

    if (!userExists) {
      throw new ResourceNotFoundError()
    }

    // Confere se o email existe
    if (email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(email)

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new UserAlreadyExistsError()
      }
    }

    // Crias Hash de senha usando o BCrypt
    let passwordHash: string | undefined

    if (password) {
      passwordHash = await hash(password, 4)
    }

    const user = await this.usersRepository.update({
      id,
      name,
      email,
      phone,
      passwordHash,
      avatar,
      active,
      role,
    })

    return { user }
  }
}
