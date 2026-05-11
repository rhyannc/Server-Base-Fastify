import { PlansRepository } from "@/repositories/plans-repository";
import { Plan } from "@prisma/client";
import { env } from "@/env";

interface FetchPlansUseCaseRequest {
    page: number
}

interface FetchPlansUseCaseResponse {
    plans: Plan[]
    meta: {
        totalCount: number
        pageIndex: number
        perPage: number
        totalPages: number
    }
}

export class FetchPlansUseCase {
    constructor(private plansRepository: PlansRepository){}

    async execute({page}: FetchPlansUseCaseRequest): Promise<FetchPlansUseCaseResponse> {
        const [plans, totalCount] = await this.plansRepository.findMany(page)
        const totalPages = Math.ceil(totalCount / env.TAKE_PAGINATION)

        return {
            plans,
            meta: {
                totalCount,
                pageIndex: page,
                perPage: env.TAKE_PAGINATION,
                totalPages,
            }
        }
    }
}   