import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { CompanyAlreadyExistsError } from '@/use-cases/errors/company-already-exists-error'
import { makeCreateCompanyUseCase } from '@/use-cases/factories/make-create-company-use-case'

export const createCompanyBodySchema = z.object({
  name: z.string(),
  cnpj: z.string().regex(/^\d+$/, 'Deve conter apenas números').min(14, 'Precisa ter minimo 14 caracteres'),
  email: z.string().email(),
  phone: z.string(),
  country: z.string().optional().describe('País (opcional, padrão BR)'),
  city: z.string(),
  state: z.string(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  cep: z.string().regex(/^\d+$/, 'Deve conter apenas números').optional(),
  createdBy: z.string().optional().describe('Criado por)'),
  active: z.boolean().optional().default(true),
  status: z.enum(['ACTIVE', 'FROZEN', 'ARCHIVED']).optional().default('ACTIVE'),
  managerId: z
    .string()
    .optional()
    .describe('Que pode criar e gerenciar novos user'),
})

export const createCompanyBodyResponse = {
  201: z
    .object({ companyId: z.uuid() })
    .describe('Company registrada com sucesso!'),
  409: z.object({ message: z.string() }).describe('Company já existente'),
}

// Função assíncrona que lida com a requisição de registro de uma nova company
export async function createCompany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const {
    name,
    cnpj,
    email,
    phone,
    country,
    city,
    state,
    address,
    number,
    complement,
    cep,
    createdBy,
    active,
    status,
    managerId,
  } = createCompanyBodySchema.parse(request.body)

  try {
    // Inversion Dependency Factoreis Pattern
    const createCompanyUseCase = makeCreateCompanyUseCase()

    const { company } = await createCompanyUseCase.execute({
      name,
      cnpj,
      email,
      phone,
      country,
      city,
      state,
      address,
      number,
      complement,
      cep,
      createdBy: createdBy ?? request.user.sub,
      active: active ?? true,
      status: status ?? 'ACTIVE',
      managerId: managerId ?? request.user.sub,
    })

    return reply.status(201).send({ companyId: company.id }) // 👉 retorna o ID
  } catch (err) {
    // Retorna um erro 409 (Conflito) caso o CNPJ já esteja cadastrado
    if (err instanceof CompanyAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }

    throw err
  }
}
