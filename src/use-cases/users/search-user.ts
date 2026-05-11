import { User } from '@prisma/client'

import { env } from '@/env'
import { UsersRepository } from '@/repositories/users-repository'

interface SearchUserUseCaseRequest {
  query: string
  page: number
}

interface SearchUserUseCaseResponse {
  users: User[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class SearchUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    query,
    page,
  }: SearchUserUseCaseRequest): Promise<SearchUserUseCaseResponse> {
    const [users, totalCount] = await this.usersRepository.searchMany(
      query,
      page,
    )

    const totalPages = Math.ceil(totalCount / env.TAKE_PAGINATION)
    return {
      users,
      meta: {
        totalCount,
        pageIndex: page,
        perPage: env.TAKE_PAGINATION,
        totalPages,
      },
    }
  }
}
