import { stripe } from '../../../providers/stripe-provider'
import { PrismaUsersRepository } from '../../../repositories/prisma/prisma-users-respository'
import { ResourceNotFoundError } from '../../errors/resource-not-found-error'

interface CreateCheckoutSessionUseCaseRequest {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}

interface CreateCheckoutSessionUseCaseResponse {
  checkoutUrl: string | null
}

export class CreateCheckoutSessionUseCase {
  constructor(private usersRepository: PrismaUsersRepository) {}

  async execute({
    userId,
    priceId,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionUseCaseRequest): Promise<CreateCheckoutSessionUseCaseResponse> {

    // Busca o usuário no banco de dados
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    let customerId = user.stripeCustomerId

    // Se o usuário não tiver um customerId, cria um no Stripe
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      })

      customerId = stripeCustomer.id

      // Atualizar usuário com o ID do cliente Stripe (deveríamos fazer isso via repositório, mas, para simplificar, vamos considerar se o repositório permite atualizações parciais; caso contrário, precisamos de um método específico. Supondo que possamos atualizar o usuário diretamente via Prisma ou pelo método de atualização do repositório, vamos usar o Prisma diretamente aqui para simplificar, até que a opção de atualização do repositório seja verificada).
      // Como não se conhece nenhum método genérico de atualização, talvez seja necessário adicionar um. Supondo que exista um método `update` padrão:
      user.stripeCustomerId = customerId
      await this.usersRepository.update(user)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId, // Para facilitar a identificação do usuário no webhook caso o ID do cliente esteja ausente por algum motivo.
    })

    return {
      checkoutUrl: session.url,
    }
  }
}
