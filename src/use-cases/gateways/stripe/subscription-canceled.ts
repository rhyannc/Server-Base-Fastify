import { UserSubscription, UsageMetric } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

interface SubscriptionCanceledUseCaseRequest {
  userId: string
}

interface SubscriptionCanceledUseCaseResponse {
  userSubscription: UserSubscription
  archivedCompanyIds: string[]
}

export class SubscriptionCanceledUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private usagesRepository: UsagesRepository,
  ) {}

  async execute({
    userId,
  }: SubscriptionCanceledUseCaseRequest): Promise<SubscriptionCanceledUseCaseResponse> {
    // 1. Busca a assinatura do usuário
    const subscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // 2. Atualiza status da assinatura para CANCELED e registra data de cancelamento
    const userSubscription = await this.userSubscriptionsRepository.update({
      id: subscription.id,
      status: 'CANCELED',
      canceledAt: new Date(),
    })

    // 3. Arquiva empresas ACTIVE e FROZEN do manager → ARCHIVED
    const archivedCompanyIds =
      await this.companiesRepository.updateStatusByManagerId(
        userId,
        ['ACTIVE', 'FROZEN'],
        'ARCHIVED',
      )

    // 4. Arquiva colaboradores ACTIVE e FROZEN dessas empresas → ARCHIVED
    await this.collaboratorsRepository.updateStatusByCompanyIds(
      archivedCompanyIds,
      ['ACTIVE', 'FROZEN'],
      'ARCHIVED',
    )

    // 5. Zerar Usage (tudo foi arquivado, não há mais recursos ACTIVE)
    const now = new Date()
    const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    // Zera o usage de empresas
    const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(
      userId,
      UsageMetric.COMPANIES,
      period,
    )
    if (companiesUsage) {
      await this.usagesRepository.setValue(companiesUsage.id, 0)
    }

    // Zera o usage de colaboradores
    const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
      userId,
      UsageMetric.COLLABORATORS,
      period,
    )
    if (collaboratorsUsage) {
      await this.usagesRepository.setValue(collaboratorsUsage.id, 0)
    }

    console.log(
      `[Subscription Canceled] Usage zerado para userId ${userId}. COMPANIES=0, COLLABORATORS=0`,
    )

    return { userSubscription, archivedCompanyIds }
  }
}
