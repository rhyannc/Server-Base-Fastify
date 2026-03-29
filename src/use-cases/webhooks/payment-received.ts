import { UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

interface PaymentReceivedUseCaseRequest {
  userId: string
}

interface PaymentReceivedUseCaseResponse {
  userSubscription: UserSubscription
  activatedCompanyIds: string[]
}

export class PaymentReceivedUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute({
    userId,
  }: PaymentReceivedUseCaseRequest): Promise<PaymentReceivedUseCaseResponse> {
    // 1. Busca a assinatura do usuário
    const subscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // 2. Atualiza status da assinatura para ACTIVE e expiresAt +30 dias
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const userSubscription = await this.userSubscriptionsRepository.update({
      id: subscription.id,
      status: 'ACTIVE',
      expiresAt,
    })

    // 3. Atualiza empresas FROZEN do manager para ACTIVE e retorna os IDs
    const activatedCompanyIds =
      await this.companiesRepository.updateStatusByManagerId(
        userId,
        'FROZEN',
        'ACTIVE',
      )

    // 4. Atualiza colaboradores FROZEN dessas empresas para ACTIVE
    await this.collaboratorsRepository.updateStatusByCompanyIds(
      activatedCompanyIds,
      'FROZEN',
      'ACTIVE',
    )

    return { userSubscription, activatedCompanyIds }
  }
}
