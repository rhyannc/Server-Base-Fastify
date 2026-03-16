import { PlansRepository } from "@/repositories/plans-repository";
import { Plan } from "@prisma/client";

interface FetchPlansUseCaseRequest {
    page: number
}

interface FetchPlansUseCaseResponse {
    plans: Plan[]
}

export class FetchPlansUseCase {
    constructor(private plansRepository: PlansRepository){}

    async execute({page}: FetchPlansUseCaseRequest): Promise<FetchPlansUseCaseResponse> {
        const plans = await this.plansRepository.findMany(page)

        return {
            plans
        }
    }
}   