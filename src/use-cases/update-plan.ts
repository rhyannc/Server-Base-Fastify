import { Plan } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'

interface UpdatePlanUseCaseRequest {
  id: string
  name: string
  description: string
  isActive: boolean
  isPopular: boolean
  price: number
  maxCompanies: number
  maxCollaborators: number
  maxInvoices: number
}

interface UpdatePlanUseCaseResponse {
  plan: Plan
}

export class UpdatePlanUseCase {
  constructor(private plansRepository: PlansRepository) {}

  async execute({
    id,
    name,
    description,
    isActive,
    isPopular,
    price,
    maxCompanies,
    maxCollaborators,
    maxInvoices,
  }: UpdatePlanUseCaseRequest): Promise<UpdatePlanUseCaseResponse> {
    const plan = await this.plansRepository.update({
      id,
      name,
      description,
      isActive,
      isPopular,
      price,
      maxCompanies,
      maxCollaborators,
      maxInvoices,
    })

    return { plan }
  }
}
