import { Plan } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'

interface SearchPlansUseCaseRequest {
  query: string
  page: number
}

interface SearchPlansUseCaseResponse {
  plans: Plan[]
}

export class SearchPlansUseCase {
  constructor(private plansRepository: PlansRepository) {}

  async execute({
    query,
    page,
  }: SearchPlansUseCaseRequest): Promise<SearchPlansUseCaseResponse> {
    const plans = await this.plansRepository.searchMany(query, page)
    return { plans }
  }
}
