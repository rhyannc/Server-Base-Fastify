import { Company, Plan, SubscriptionStatus, UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { PlanNotActiveError } from './errors/plan-not-active-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UserSubscriptionAlreadyExistsError } from './errors/user-subscription-already-exists-error'
import { UserSubscriptionNotExistsPlanError } from './errors/user-subscription-not-exists-plan-error'

interface UpdateUserSubscriptionUseCaseRequest {
  userId: string
  planId?: string
  status?: SubscriptionStatus
}

interface UpdateUserSubscriptionUseCaseResponse {
  userSubscription: UserSubscription
}

export class UpdateUserSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private usagesRepository: UsagesRepository,
  ) {}

  async execute({
    userId,
    planId,
    status,
  }: UpdateUserSubscriptionUseCaseRequest): Promise<UpdateUserSubscriptionUseCaseResponse> {

    // Verifica se o usuario ja tem plano
    const userSubscription =
      await this.userSubscriptionsRepository.findByUserId(userId)
    if (!userSubscription) {
      throw new ResourceNotFoundError()
    }

    //verificar se o plano existe e se esta ativo
    if (planId) {
      const plan = await this.plansRepository.findById(planId)
      if (!plan) {
        throw new ResourceNotFoundError()
      }

      if (!plan.isActive) {
        throw new PlanNotActiveError()
      }
      
      userSubscription.planId = planId
    }

    if (status) {
      userSubscription.status = status
    }

    const updatedSubscription = await this.userSubscriptionsRepository.update({
      id: userSubscription.id,
      planId: userSubscription.planId,
      status: userSubscription.status,
    })

    // Lógica de Downgrade: Verificar limites do novo plano
    const plan = await this.plansRepository.findById(
      updatedSubscription.planId,
    )

    if (plan) {
      // 1. Verificar limite de Empresas (maxCompanies)
      if (plan.maxCompanies) {
        const companies = await this.companiesRepository.findManyByManagerId(
          userId,
        )
        const activeOrFrozenCompanies = companies.filter(
          (c) => c.status === 'ACTIVE' || c.status === 'FROZEN',
        )

        if (activeOrFrozenCompanies.length > plan.maxCompanies) {
          // As empresas já vêm ordenadas por lastAccess DESC no repository
          const companiesToArchive = activeOrFrozenCompanies.slice(plan.maxCompanies)
          const companyIdsToArchive = companiesToArchive.map((c: Company) => c.id)

          // Como as empresas a arquivar são poucas normalmente, podemos fazer um loop ou adicionar updateStatusByIds
          for (const companyId of companyIdsToArchive) {
            await this.companiesRepository.update({
              id: companyId,
              status: 'ARCHIVED',
            })

            // Arquiva colaboradores dessas empresas
            await this.collaboratorsRepository.updateStatusByCompanyIds(
              [companyId],
              ['ACTIVE', 'FROZEN'],
              'ARCHIVED',
            )
          }
        }
      }

      // 2. Verificar limite de Colaboradores (maxCollaborators)
      if (plan.maxCollaborators) {
        const activeCollaboratorsCount =
          await this.collaboratorsRepository.countActiveByManagerId(userId)

        if (activeCollaboratorsCount > plan.maxCollaborators) {
          const collaborators =
            await this.collaboratorsRepository.findManyByManagerId(userId)
          
          // Filtra apenas os ativos das empresas que ainda estão ativas (já que as outras foram arquivadas acima)
          // Filtra apenas os ativos ou congelados das empresas que ainda estão ativas (já que as outras foram arquivadas acima)
          const activeOrFrozenCollaborators = collaborators.filter(
            (c) => c.status === 'ACTIVE' || c.status === 'FROZEN',
          )

          if (activeOrFrozenCollaborators.length > plan.maxCollaborators) {
            // Collaborators vêm ordenados por createdAt ASC (mais antigos primeiro)
            // Mas queremos manter os mais novos? O user não especificou.
            // Geralmente mantém os mais antigos ou os mais novos. 
            // "deve ser desativado ate ficar no limit do novo plano"
            // Vamos manter os mais antigos (quem chegou primeiro fica)? Ou os mais novos?
            // Vou seguir a lógica de empresas (manter os mais recentes acessados), mas como não tem lastAccess, vou manter os mais novos (createdAt DESC).
            
            const sortedCollaborators = activeOrFrozenCollaborators.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            )

            const collaboratorsToArchive = sortedCollaborators.slice(
              plan.maxCollaborators,
            )

            for (const collaborator of collaboratorsToArchive) {
              await this.collaboratorsRepository.update({
                id: collaborator.id,
                status: 'ARCHIVED',
              })
            }
          }
        }
      }

      // 3. Sincronizar Uso (Usage)
      const currentPeriod = new Date()
      currentPeriod.setDate(1)
      currentPeriod.setHours(0, 0, 0, 0)

      // COMPANIES
      const finalCompanies = await this.companiesRepository.findManyByManagerId(userId)
      const finalActiveCompaniesCount = finalCompanies.filter(c => c.status === 'ACTIVE' || c.status === 'FROZEN').length
      
      const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(userId, 'COMPANIES', currentPeriod)
      if (companiesUsage) {
        await this.usagesRepository.setValue(companiesUsage.id, finalActiveCompaniesCount)
      } else {
        await this.usagesRepository.create({
          userId,
          metric: 'COMPANIES',
          period: currentPeriod,
          value: finalActiveCompaniesCount,
        })
      }

      // COLLABORATORS
      const finalActiveCollaboratorsCount = await this.collaboratorsRepository.countActiveByManagerId(userId)
      
      const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(userId, 'COLLABORATORS', currentPeriod)
      if (collaboratorsUsage) {
        await this.usagesRepository.setValue(collaboratorsUsage.id, finalActiveCollaboratorsCount)
      } else {
        await this.usagesRepository.create({
          userId,
          metric: 'COLLABORATORS',
          period: currentPeriod,
          value: finalActiveCollaboratorsCount,
        })
      }
    }

    return { userSubscription: updatedSubscription }
  }
}
