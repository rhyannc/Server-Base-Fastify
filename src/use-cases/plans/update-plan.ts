import { Plan } from '@prisma/client'

import { PlansRepository } from '@/repositories/plans-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface UpdatePlanUseCaseRequest {
  id: string
  name?: string
  description?: string
  isActive?: boolean
  isPopular?: boolean
  price?: number
  maxCompanies?: number
  maxCollaborators?: number
  maxInvoices?: number
  stripeProductId?: string | null
  stripePriceId?: string | null
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
    stripeProductId,
    stripePriceId,
  }: UpdatePlanUseCaseRequest): Promise<UpdatePlanUseCaseResponse> {
    const planExists = await this.plansRepository.findById(id)

    if (!planExists) {
      throw new ResourceNotFoundError()
    }

    const plan = await this.plansRepository.update({
      id,
      name: name ?? planExists.name,
      description: description ?? planExists.description,
      isActive: isActive ?? planExists.isActive,
      isPopular: isPopular ?? planExists.isPopular,
      price: price ?? Number(planExists.price),
      maxCompanies: maxCompanies ?? planExists.maxCompanies,
      maxCollaborators: maxCollaborators ?? planExists.maxCollaborators,
      maxInvoices: maxInvoices ?? planExists.maxInvoices,
      stripeProductId: stripeProductId ?? planExists.stripeProductId,
      stripePriceId: stripePriceId ?? planExists.stripePriceId,
    })

    return { plan }
  }
}
