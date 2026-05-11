import { User } from '@prisma/client'

import { env } from '@/env'
import { UsersRepository } from '@/repositories/users-repository'

interface FetchUsersUseCaseRequest {
  page: number
}

interface FetchUsersUseCaseResponse {
  users: User[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class FetchUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    page,
  }: FetchUsersUseCaseRequest): Promise<FetchUsersUseCaseResponse> {
    const [users, totalCount] = await this.usersRepository.findMany(page)

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
