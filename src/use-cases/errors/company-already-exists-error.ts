export class CompanyAlreadyExistsError extends Error {
  constructor() {
    super('Empresa com Cnpj já existente')
  }
}
