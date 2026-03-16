import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFetchUsersUseCase } from '@/use-cases/factories/make-fetch-users-use-case'

export const findUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function findUsers(request: FastifyRequest, reply: FastifyReply) {
  const { page } = findUsersQuerySchema.parse(request.query)

  const fetchUsersUseCase = makeFetchUsersUseCase()

  const { users } = await fetchUsersUseCase.execute({
    page,
  })

  if (!users || users.length === 0) {
    return reply.status(404).send({
      message: 'Nenhum usuário encontrado.',
      users: [],
    })
  }

  const usersWithoutPassword = users.map((user) => {
    const { passwordHash, ...userData } = user
    return userData
  })

  return reply.status(200).send({ users: usersWithoutPassword })
}
