// Interceptador para validar se tem e se é valido o JWT Recebido
// Que passado no Routes (onRequest: [verifyJWT],)

import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Não Autoziado.' })
  }
}
