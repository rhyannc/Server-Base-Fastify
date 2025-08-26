import { hash } from 'bcryptjs'

import { usersRepository } from '@/repositories/users-respository'

import { UserAlreadyExistsError } from './errors/user-already-exists'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

export class RegisterUseCase {
  constructor(private usersRepository: usersRepository) {}
  async execute({ name, email, password }: RegisterUseCaseRequest) {
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
      password_hash,
    })

    return user // Retorna o usuário criado
  }
}
