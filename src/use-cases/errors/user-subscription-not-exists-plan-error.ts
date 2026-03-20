export class UserSubscriptionNotExistsPlanError extends Error {
  constructor() {
    super('Usuário não possui plano.')
  }
}
