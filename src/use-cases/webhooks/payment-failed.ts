import { UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

interface PaymentFailedUseCaseRequest {
  userId: string
}

interface PaymentFailedUseCaseResponse {
  userSubscription: UserSubscription
  frozenCompanyIds: string[]
}

export class PaymentFailedUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute({
    userId,
  }: PaymentFailedUseCaseRequest): Promise<PaymentFailedUseCaseResponse> {
    // 1. Busca a assinatura do usuário
    const subscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // 2. Atualiza status da assinatura para EXPIRED
    const userSubscription = await this.userSubscriptionsRepository.update({
      id: subscription.id,
      status: 'EXPIRED',
    })

    // 3. Congela empresas ACTIVE do manager → FROZEN e retorna os IDs
    const frozenCompanyIds =
      await this.companiesRepository.updateStatusByManagerId(
        userId,
        'ACTIVE',
        'FROZEN',
      )

    // 4. Congela colaboradores ACTIVE dessas empresas → FROZEN
    await this.collaboratorsRepository.updateStatusByCompanyIds(
      frozenCompanyIds,
      'ACTIVE',
      'FROZEN',
    )

    return { userSubscription, frozenCompanyIds }
  }
}
