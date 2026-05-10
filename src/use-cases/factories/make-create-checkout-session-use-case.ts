import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-respository'
import { PrismaPlansRepository } from '../../repositories/prisma/prisma-plans-repository'
import { CreateCheckoutSessionUseCase } from '../gateways/stripe/create-checkout-session'

export function makeCreateCheckoutSessionUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const plansRepository = new PrismaPlansRepository()
  const useCase = new CreateCheckoutSessionUseCase(usersRepository, plansRepository)

  return useCase
}
