export class PlanNotActiveError extends Error {
  constructor() {
    super('O plano selecionado não está ativo e não pode ser assinado.')
  }
}
