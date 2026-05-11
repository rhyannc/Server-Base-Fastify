import { Plan } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'
import { env } from '@/env'

interface SearchPlansUseCaseRequest {
  query: string
  page: number
}

interface SearchPlansUseCaseResponse {
  plans: Plan[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class SearchPlansUseCase {
  constructor(private plansRepository: PlansRepository) {}

  async execute({
    query,
    page,
  }: SearchPlansUseCaseRequest): Promise<SearchPlansUseCaseResponse> {
    const [plans, totalCount] = await this.plansRepository.searchMany(query, page)
    const totalPages = Math.ceil(totalCount / env.TAKE_PAGINATION)

    return {
      plans,
      meta: {
        totalCount,
        pageIndex: page,
        perPage: env.TAKE_PAGINATION,
        totalPages,
      },
    }
  }
}
