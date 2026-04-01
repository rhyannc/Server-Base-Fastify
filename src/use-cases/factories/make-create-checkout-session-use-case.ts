import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-respository'
import { CreateCheckoutSessionUseCase } from '../gateways/stripe/create-checkout-session'

export function makeCreateCheckoutSessionUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new CreateCheckoutSessionUseCase(usersRepository)

  return useCase
}
