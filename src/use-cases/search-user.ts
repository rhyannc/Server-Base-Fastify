import { User } from '@prisma/client'

import { UsersRepository } from '@/repositories/users-repository'

interface SearchUserUseCaseRequest {
  query: string
  page: number
}

interface SearchUserUseCaseResponse {
  users: User[]
}

export class SearchUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    query,
    page,
  }: SearchUserUseCaseRequest): Promise<SearchUserUseCaseResponse> {
    const users = await this.usersRepository.searchMany(query, page)
    return { users }
  }
}
