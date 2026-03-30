export class UserNotPlanError extends Error {
  constructor() {
    super('O usuário não possui um plano ativo.')
  }
}
