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
