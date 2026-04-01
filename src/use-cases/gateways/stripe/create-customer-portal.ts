import { stripe } from '../../../providers/stripe-provider'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-respository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface CreateCustomerPortalUseCaseRequest {
  userId: string
  returnUrl: string
}

interface CreateCustomerPortalUseCaseResponse {
  portalUrl: string
}

export class CreateCustomerPortalUseCase {
  constructor(private usersRepository: PrismaUsersRepository) {}

  async execute({
    userId,
    returnUrl,
  }: CreateCustomerPortalUseCaseRequest): Promise<CreateCustomerPortalUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (!user.stripeCustomerId) {
      throw new Error('User does not have a Stripe Customer ID')
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    })

    return {
      portalUrl: portalSession.url,
    }
  }
}
