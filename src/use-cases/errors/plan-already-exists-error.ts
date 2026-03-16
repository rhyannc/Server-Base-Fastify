export class PlanAlreadyExistsError extends Error {
  constructor() {
    super('Plano ja Cadastrado')
  }
}
