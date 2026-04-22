import { Collaborator, Role, RoleCollaborator, Status, UsageMetric } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { GenericUnauthorizedError } from '../errors/generic-unauthorized-error'
import { PlanLimitReachedError } from '../errors/plan-limit-reached-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface UpdateCollaboratorUseCaseRequest {
  collaboratorId: string
  role?: RoleCollaborator
  status?: Status
}

interface UpdateCollaboratorUseCaseResponse {
  collaborator: Collaborator
}

export class UpdateCollaboratorUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
    private usagesRepository: UsagesRepository,
  ) {}

  async execute({
    collaboratorId,
    meId,
    meSysRole,
    role,
    status,
  }: UpdateCollaboratorUseCaseRequest & {
    meId: string
    meSysRole: Role
  }): Promise<UpdateCollaboratorUseCaseResponse> {
    //  Verifica se o COLABORADOR existe
    const collaborator =
      await this.collaboratorsRepository.findById(collaboratorId)

    if (!collaborator) {
      throw new ResourceNotFoundError()
    }

    // Verifica se a empresa existe
    const company = await this.companiesRepository.findById(
      collaborator.companyId,
    )
    if (!company) {
      throw new ResourceNotFoundError()
    }

    //  Validação de Permissão (ADMIN ou Manager da Empresa)
    if (meSysRole !== 'ADMIN' && company.managerId !== meId) {
      // Verifica se sou um colaborador com role LEAD nessa empresa

      const authorCollaborator =
        await this.collaboratorsRepository.findByCompanyAndUser(
          collaborator.companyId,
          meId,
        )
      if (!authorCollaborator || authorCollaborator.role !== 'LEAD') {
        throw new GenericUnauthorizedError()
      }
    }

    const managerId = company.managerId
    const now = new Date()
    const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const newStatus = status ?? collaborator.status
    const statusChanged = newStatus !== collaborator.status

    // =============================================
    // ACTIVE → FROZEN (Congelar colaborador)
    // =============================================
    if (statusChanged && collaborator.status === 'ACTIVE' && newStatus === 'FROZEN') {
      // Decrementa usage de COLLABORATORS (-1)
      const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
        managerId,
        UsageMetric.COLLABORATORS,
        period,
      )
      if (collaboratorsUsage && collaboratorsUsage.value > 0) {
        await this.usagesRepository.decrement(collaboratorsUsage.id, 1)
      }

      console.log(
        `[Update Collaborator] Colaborador ${collaboratorId} congelado. Usage COLLABORATORS -1 para manager ${managerId}`,
      )
    }

    // =============================================
    // FROZEN/ARCHIVED → ACTIVE (Reativar colaborador)
    // =============================================
    if (statusChanged && (collaborator.status === 'FROZEN' || collaborator.status === 'ARCHIVED') && newStatus === 'ACTIVE') {
      // Verifica limite do plano
      const subscription = await this.userSubscriptionsRepository.findByUserId(managerId)
      if (!subscription) {
        throw new ResourceNotFoundError()
      }

      const plan = await this.plansRepository.findById(subscription.planId)
      if (!plan) {
        throw new ResourceNotFoundError()
      }

      if (plan.maxCollaborators !== null) {
        const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
          managerId,
          UsageMetric.COLLABORATORS,
          period,
        )
        const currentValue = collaboratorsUsage ? collaboratorsUsage.value : 0

        if (currentValue + 1 > plan.maxCollaborators) {
          throw new PlanLimitReachedError(UsageMetric.COLLABORATORS)
        }
      }

      // Incrementa usage de COLLABORATORS (+1)
      const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
        managerId,
        UsageMetric.COLLABORATORS,
        period,
      )
      if (collaboratorsUsage) {
        await this.usagesRepository.increment(collaboratorsUsage.id, 1)
      } else {
        await this.usagesRepository.create({
          userId: managerId,
          metric: UsageMetric.COLLABORATORS,
          period,
          value: 1,
        })
      }

      console.log(
        `[Update Collaborator] Colaborador ${collaboratorId} reativado (de ${collaborator.status}). Usage COLLABORATORS +1 para manager ${managerId}`,
      )
    }

    const updatedCollaborator = await this.collaboratorsRepository.update({
      id: collaboratorId,
      role: role ?? collaborator.role,
      status: newStatus,
    })

    return { collaborator: updatedCollaborator }
  }
}
