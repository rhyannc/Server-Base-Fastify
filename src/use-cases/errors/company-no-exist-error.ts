export class CompanyNoExistError extends Error {
  constructor() {
    super('Empresa não existe.')
  }
}
