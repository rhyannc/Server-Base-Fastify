import { Collaborator } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'

interface FetchUserCompaniesUseCaseRequest {
  userId: string
  page: number
}

interface FetchUserCompaniesUseCaseResponse {
  collaborators: Collaborator[]
}

export class FetchUserCompaniesUseCase {
  constructor(private collaboratorsRepository: CollaboratorsRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserCompaniesUseCaseRequest): Promise<FetchUserCompaniesUseCaseResponse> {
    const collaborators = await this.collaboratorsRepository.findManyByUser(
      userId,
      page,
    )

    return { collaborators }
  }
}
