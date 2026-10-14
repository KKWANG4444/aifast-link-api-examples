// 沿用 Link 成本工具的比较逻辑；每日工作量相同，日额度不能跨天抵扣。
export function comparePlanCost(input) {
  const { planPrice, dailyAllowance, dailyUsage, usageDays, dailyPayg, walletFallback, overageRate } = input;
  if (![planPrice, dailyAllowance, dailyUsage, usageDays, dailyPayg].every(value =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e9
  ) || typeof walletFallback !== 'boolean') throw new Error('invalid-input');
  if (!Number.isInteger(usageDays) || usageDays > 30) throw new Error('invalid-days');
  const overageCredits = Math.max(0, dailyUsage - dailyAllowance) * usageDays;
  if (overageCredits > 0 && walletFallback &&
      !(typeof overageRate === 'number' && Number.isFinite(overageRate) && overageRate >= 0 && overageRate <= 1e9)) {
    throw new Error('invalid-overage-rate');
  }
  const covered = overageCredits === 0 || walletFallback;
  const paygTotal = dailyPayg * usageDays;
  const overageCost = covered ? (overageCredits > 0 ? overageCredits * overageRate : 0) : null;
  const planTotal = covered ? planPrice + overageCost : null;
  if ([paygTotal, overageCredits, overageCost, planTotal].some(value => value !== null && value > Number.MAX_SAFE_INTEGER / 100)) {
    throw new Error('unsafe-result');
  }
  return { covered, paygTotal, planPrice, overageCredits, overageCost, planTotal };
}
