import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchUserUseCase } from '@/use-cases/factories/make-search-user-use-case'

export const searchUsersQuerySchema = z.object({
  q: z.string().min(1, 'q não pode ser vazio').describe('Pesquisa por Nome ou Email'),
  page: z.coerce.number().min(1).default(1),
})

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const { q, page } = searchUsersQuerySchema.parse(request.query)

  const searchUserUseCase = makeSearchUserUseCase()

  const { users } = await searchUserUseCase.execute({
    query: q,
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
