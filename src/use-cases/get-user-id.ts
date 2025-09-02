import { User } from '@prisma/client'

import { usersRepository } from '@/repositories/users-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetUserIdUseCaseRequest {
  userId: string
}

interface GetUserIdUseCaseResponse {
  user: User
}

export class GetUserIdUseCase {
  constructor(private usersRepository: usersRepository) {}

  async execute({
    userId,
  }: GetUserIdUseCaseRequest): Promise<GetUserIdUseCaseResponse> {
    // Confere email esta no BD
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return { user }
  }
}
