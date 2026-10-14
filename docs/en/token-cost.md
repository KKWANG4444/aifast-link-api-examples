# GPT, Claude and Gemini API token costs: formula and examples

[Home](../../README.en.md) · [简体中文](../token-cost.md) · [Download offline examples](https://github.com/KKWANG4444/aifast-link-api-examples/releases/latest)

Use the effective input/output rates and billing units for your current group, then compare the same workload. A model name does not determine the price. Credits, CNY and USD are not interchangeable. This tool has no built-in model quotes, price fetching or model calls.

## Reproduce a 1,000-task estimate

Assume $2.50 per million input tokens, $10 per million output tokens, 3,000 input and 800 output tokens per task, 1,000 planned tasks and 10% additional billed retries. These are **illustrative inputs, not current offers**.

```text
Per task = (3000 * 2.5 + 800 * 10) / 1000000 = $0.0155
Base cost = 0.0155 * 1000 = $15.50
Billed retries = 15.50 * 10% = $1.55
Total = 15.50 + 1.55 = $17.05
```

Run from the repository root:

```bash
node scripts/cost.mjs token examples/token-cost.json
node --test
```

The JSON fields `baseCost`, `billedRetryCost` and `totalCost` hold those three totals. Format money at your billing precision for display; do not round each request before summing.

## Input fields and units

Edit [token-cost.json](../../examples/token-cost.json). Keep JSON numbers numeric, without quotes.

| Field | Unit and constraint |
| --- | --- |
| `currency` | `USD` or `CNY`; labels the result without converting currencies |
| `inputPrice` | Effective price per million input tokens, nonnegative |
| `outputPrice` | Effective price per million output tokens, nonnegative |
| `inputTokens` | Input tokens per planned task, nonnegative integer |
| `outputTokens` | Output tokens per planned task, nonnegative integer |
| `tasks` | Planned task count, integer of at least 1 |
| `billedRetryPercent` | Additional billed retries / planned tasks * 100, from 0 to 1000 |

Multiply a per-thousand-token quote by 1000 before using it as a per-million rate. Use the same currency and model group for both prices; do not apply a multiplier twice when it is already included in the quote.

## Count only billed retries

For 100 planned tasks and 8 retries of which only 3 were billed, enter **3%**, not 8%. Zero without logs is provisional, not evidence of zero cost. Each retry is assumed to use the same input/output tokens and rates as one planned task; calculate changed histories or model switches separately.

## Separate cache and tool fees

This tool accepts one input rate and one output rate. It does not identify **cache reads, cache writes, long-context tiers, images or tool fees**. Reconcile non-overlapping usage categories at their respective rates, then sum them. If total input tokens already include cache hits, do not add those cached tokens a second time.

Choosing a monthly plan also requires active days, eligible groups and daily overages. Daily Credits are not a fixed token quantity. Do not assume GPT/Claude monthly plans cover the separate Gemini group.

[Calculate online](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_en_calculator) · [Monthly plan comparison](monthly-plan-vs-payg.md) · [Current Link prices](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_en_pricing)
