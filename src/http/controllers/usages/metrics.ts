import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchUserUsagesUseCase } from '@/use-cases/factories/make-fetch-user-usages-use-case'

export async function metrics(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub

  const fetchUserUsagesUseCase = makeFetchUserUsagesUseCase()

  const { usages } = await fetchUserUsagesUseCase.execute({
    userId,
  })

  return reply.status(200).send({ usages })
}
