export function estimateTokenCost(input) {
  const { currency, inputPrice, outputPrice, inputTokens, outputTokens, tasks, billedRetryPercent } = input;
  if (!['USD', 'CNY'].includes(currency)) throw new Error('invalid-currency');
  if (![inputPrice, outputPrice, inputTokens, outputTokens, tasks, billedRetryPercent].every(value =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0
  ) || tasks < 1 || billedRetryPercent > 1000) throw new Error('invalid-input');
  if (![inputTokens, outputTokens, tasks].every(Number.isSafeInteger)) throw new Error('invalid-count');
  const perTask = (inputPrice * inputTokens + outputPrice * outputTokens) / 1_000_000;
  const baseCost = perTask * tasks;
  const billedRetryCost = baseCost * billedRetryPercent / 100;
  const totalCost = baseCost + billedRetryCost;
  const estimatedBillableRequests = tasks * (1 + billedRetryPercent / 100);
  const estimatedTokens = (inputTokens + outputTokens) * estimatedBillableRequests;
  if (![perTask, baseCost, billedRetryCost, totalCost, estimatedBillableRequests, estimatedTokens].every(Number.isFinite) ||
      estimatedBillableRequests > Number.MAX_SAFE_INTEGER || estimatedTokens > Number.MAX_SAFE_INTEGER ||
      totalCost > Number.MAX_SAFE_INTEGER / 100) throw new Error('unsafe-result');
  return { currency, perTask, baseCost, billedRetryCost, totalCost, estimatedBillableRequests, estimatedTokens };
}
