import { Usage } from '@prisma/client'

import { UsagesRepository } from '@/repositories/usages-repository'

interface FetchUserUsagesUseCaseRequest {
  userId: string
}

interface FetchUserUsagesUseCaseResponse {
  usages: Usage[]
}

export class FetchUserUsagesUseCase {
  constructor(private usagesRepository: UsagesRepository) {}

  async execute({
    userId,
  }: FetchUserUsagesUseCaseRequest): Promise<FetchUserUsagesUseCaseResponse> {
    const now = new Date()
    const period = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )

    const usages = await this.usagesRepository.findManyByUserId(userId, period)

    return { usages }
  }
}
