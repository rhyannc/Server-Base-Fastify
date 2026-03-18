export class PlanLimitReachedError extends Error {
  constructor(metric: string) {
    super(`O limite do seu plano para ${metric} foi atingido. Considere fazer um upgrade.`)
  }
}
