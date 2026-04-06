export class CompanyAlreadyExistsError extends Error {
  constructor() {
    super('Empresa com CNPJ já existente!')
  }
}
