import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-respository'
import { CreateCustomerPortalUseCase } from '../gateways/stripe/create-customer-portal'

export function makeCreateCustomerPortalUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new CreateCustomerPortalUseCase(usersRepository)

  return useCase
}
