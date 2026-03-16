import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { PlansRepository } from '../plans-repository'

export class PrismaPlansRepository implements PlansRepository {
 

    async searchMany(query: string, page: number){
        const plans = await prisma.plan.findMany({
            where: {
                name: {
                    contains: query,
                },
            },
            take: 10,
            skip: (page - 1) * 10,
        })
        return plans
    }

    async create(data: Prisma.PlanCreateInput){
        const plan = await prisma.plan.create({ data })
        return plan
    }
}