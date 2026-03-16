import { User } from '@prisma/client'

import { UsersRepository } from '@/repositories/users-repository'

interface FetchUsersUseCaseRequest {
  page: number
}

interface FetchUsersUseCaseResponse {
  users: User[]
}

export class FetchUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page,
  }: FetchUsersUseCaseRequest): Promise<FetchUsersUseCaseResponse> {
    const users = await this.usersRepository.findMany(page)

    return {
      users,
    }
  }
}
