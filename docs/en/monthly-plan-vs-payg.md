# API monthly plans versus pay-as-you-go: active days and overages

[Home](../../README.en.md) · [简体中文](../monthly-plan-vs-payg.md)

Compare the cash cost of the **same workload**. Calculate pay-as-you-go charges and plan-group Credit consumption separately. Credits are internal usage units, not cash or a fixed token quantity. GPT / Claude plans apply to specified groups; do not assume Gemini is included.

The calculator assumes a 30-day plan, equal workload on each active day and no daily-allowance carryover. For uneven usage, calculate overages day by day. Refunds are outside the estimate; check actual purchase terms.

## Illustrative example, not an offer

Assume a CNY 200 plan, 20 daily Credits, 10 Credits used per active day, and CNY 12/day pay-as-you-go for the same workload.

| Active days | Pay-as-you-go | Full plan fee |
| --- | --- | --- |
| 0 | CNY 0 | CNY 200 |
| 5 | CNY 60 | CNY 200 |
| 20 | CNY 240 | CNY 200 |
| 30 | CNY 360 | CNY 200 |

```bash
node scripts/cost.mjs plan examples/monthly-plan.json
node scripts/cost.mjs plan examples/monthly-plan-overage.json
```

The overage example uses 25 Credits/day for 20 days: 100 Credits exceed the daily allowance. With confirmed wallet fallback and an illustrative CNY 0.70/Credit rate, total cost is `200 + 100 * 0.7 = 270`, above CNY 240 pay-as-you-go.

Without wallet fallback the output is `covered: false` and `planTotal: null`, not a claim that CNY 200 covers all work. A missing overage rate is an error, not free overage.

<a id="compare-scenarios"></a>
## Compare active days and three allowance scenarios in one command

Run from the repository directory. No dependencies, account, API key or network access are required:

```bash
node scripts/plan-scenarios.mjs
```

The command reads the two JSON fixtures above and outputs 12 rows: three scenarios at 0 / 5 / 20 / 30 active days. Bundled inputs produce these CNY amounts:

| Active days | Pay-as-you-go | Within allowance (10 Credits/day) | Wallet fallback (25 Credits/day) | No fallback (25 Credits/day) |
| --- | --- | --- | --- | --- |
| 0 | 0 | 200 | 200 | 200, no workload |
| 5 | 60 | 200 | 217.50 | Full workload not covered |
| 20 | 240 | 200 | 270 | Full workload not covered |
| 30 | 360 | 200 | 305 | Full workload not covered |

**Each scenario assumes CNY 12/day pay-as-you-go for its own workload.** The 10-Credit and 25-Credit cases are separate illustrations, not evidence that pay-as-you-go stays unchanged when usage increases, nor a Credit-to-currency exchange rate. Verify matching `dailyPayg` and `dailyUsage` for each real workload.

The output marks `illustrative: true`, not live prices or billing evidence. Each row includes `input`, `result` and its source file. With overages, `overage-without-fallback` returns `covered: false` and `planTotal: null`, not zero cost. The full purchased plan fee still counts with zero usage.

Replace prices and usage in the two JSON fixtures to rerun. The command overrides only `usageDays`, plus `walletFallback: false` in the third scenario, without rewriting files. Equal daily workloads, no allowance carryover and no refunds remain assumptions.

| JSON field | Meaning |
| --- | --- |
| `planPrice` | Full 30-day cash payment in CNY |
| `dailyAllowance` | Daily Credit allowance |
| `dailyUsage` | Credits for the workload per active day |
| `usageDays` | Integer from 0 to 30 |
| `dailyPayg` | Same-workload daily cash cost in CNY, including billed retries |
| `walletFallback` | Boolean: fallback confirmed for both plan and account |
| `overageRate` | Effective same-group CNY/Credit, required for billable overages |

In token fixtures, `billedRetryPercent` counts only additional retries that incurred charges, assuming the same tokens and unit prices as the planned task. Unbilled failures are excluded.

[Compare online](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=plan_en_calculator) · [Check plan rules](https://docs.aifast.link/en/payment/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=plan_en_payment)
