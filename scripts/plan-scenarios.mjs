import { readFile } from 'node:fs/promises';
import { comparePlanCost } from '../src/plan-cost.mjs';

if (process.argv.length > 2) {
  console.error('用法: node scripts/plan-scenarios.mjs');
  process.exitCode = 1;
} else {
  try {
    const fixture = async name => JSON.parse(await readFile(new URL(`../examples/${name}.json`, import.meta.url), 'utf8'));
    const within = await fixture('monthly-plan');
    const overage = await fixture('monthly-plan-overage');
    const scenarios = [
      ['within-allowance', 'examples/monthly-plan.json', within],
      ['overage-with-fallback', 'examples/monthly-plan-overage.json', overage],
      ['overage-without-fallback', 'examples/monthly-plan-overage.json', { ...overage, walletFallback: false }],
    ];
    const rows = scenarios.flatMap(([scenario, source, fixtureInput]) => [0, 5, 20, 30].map(usageDays => {
      const input = { ...fixtureInput, usageDays };
      return { scenario, source, input, result: comparePlanCost(input) };
    }));
    console.log(JSON.stringify({
      illustrative: true,
      currency: 'CNY',
      assumptions: {
        planPeriodDays: 30,
        equalWorkloadPerActiveDay: true,
        dailyAllowanceCarryover: false,
        paygMatchesWorkloadWithinEachRow: true,
        refundsIncluded: false,
        creditsAreCurrency: false,
      },
      rows,
    }, null, 2));
  } catch (error) {
    const codes = new Set(['invalid-input', 'invalid-days', 'invalid-overage-rate', 'unsafe-result']);
    console.error(codes.has(error.message) ? error.message : 'invalid-json-or-file');
    process.exitCode = 1;
  }
}
