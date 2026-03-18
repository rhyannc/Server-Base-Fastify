export class UserSubscriptionAlreadyExistsError extends Error {
  constructor() {
    super('Usuário já possui uma assinatura ativa.')
  }
}
