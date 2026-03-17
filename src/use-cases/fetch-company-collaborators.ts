import { Collaborator } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'

interface FetchCompanyCollaboratorsUseCaseRequest {
  companyId: string
  page: number
}

interface FetchCompanyCollaboratorsUseCaseResponse {
  collaborators: Collaborator[]
}

export class FetchCompanyCollaboratorsUseCase {
  constructor(private collaboratorsRepository: CollaboratorsRepository) {}

  async execute({
    companyId,
    page,
  }: FetchCompanyCollaboratorsUseCaseRequest): Promise<FetchCompanyCollaboratorsUseCaseResponse> {
    const collaborators = await this.collaboratorsRepository.findManyByCompany(
      companyId,
      page,
    )

    return { collaborators }
  }
}
