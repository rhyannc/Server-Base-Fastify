
import { Plan } from "@prisma/client"

import { PlansRepository } from "@/repositories/plans-repository"
import { ResourceNotFoundError } from "./errors/resource-not-found-error"

interface GetPlanIdUseCaseRequest {
    planId: number
}

interface GetPlanIdUseCaseResponse {
    plan: Plan
}

export class GetPlanIdUseCase{
    constructor(private  plansRepository: PlansRepository) {}

    async execute({
        planId,
    }: GetPlanIdUseCaseRequest): Promise<GetPlanIdUseCaseResponse> {
        // Confere id esta no BD
        const plan = await this.plansRepository.findById(planId)

        if (!plan) {
            throw new ResourceNotFoundError()
        }

        return { plan }
    }
} 
 