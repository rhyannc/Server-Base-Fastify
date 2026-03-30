import { Plan } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'

interface CreatePlanUseCaseRequest {
  name: string
  description: string
  isActive: boolean
  isPopular: boolean
  price: number
  maxCompanies: number | null
  maxCollaborators: number | null
  maxInvoices: number | null
}

interface CreatePlanUseCaseResponse {
  plan: Plan
}

export class CreatePlanUseCase {
  constructor(private plansRepository: PlansRepository) {}
  async execute({
    name,
    description,
    isActive,
    isPopular,
    price,
    maxCompanies,
    maxCollaborators,
    maxInvoices,
  }: CreatePlanUseCaseRequest): Promise<CreatePlanUseCaseResponse> {

    // Cadastra no BD
    const plan = await this.plansRepository.create({
      name,
      description,
      isActive,
      isPopular,
      price,
      maxCompanies,
      maxCollaborators,
      maxInvoices,
    })

    return { plan } // Retorna o plano cadastrado
  }
}
