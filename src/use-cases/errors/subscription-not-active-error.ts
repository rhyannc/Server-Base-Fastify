export class SubscriptionNotActiveError extends Error {
  constructor() {
    super('Assinatura não está Ativa, assine um Plano para liberar o uso!')
  }
}
