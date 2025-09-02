// Interceptador para validar se  usuario tem permiçao para a ação
// Que passado no Routes (onRequest: [verifyUserRol('ADMIN'))],)

import { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUserRole(roleToVerify: 'ADMIN' | 'MEMBER') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user
    if (role !== roleToVerify) {
      return reply.status(401).send({ message: 'Usuario não Autoziado.' })
    }
  }
}
