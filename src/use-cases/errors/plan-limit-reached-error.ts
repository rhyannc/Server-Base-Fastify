export class PlanLimitReachedError extends Error {
  constructor(metric: string) {
    super(`O limite do plano para ${metric} do Proprietario da empresa foi atingido. Considere fazer um upgrade.`)
  }
}
