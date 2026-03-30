export class CompanyNotActiveError extends Error {
  constructor() {
    super('Esta empresa não está ativa. Verifique sua assinatura ou situação da conta.')
  }
}
