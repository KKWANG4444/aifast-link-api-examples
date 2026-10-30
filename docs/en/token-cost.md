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

## Map API usage to calculator inputs

Chat Completions uses `usage.prompt_tokens` and `usage.completion_tokens`; Responses uses `usage.input_tokens` and `usage.output_tokens`. Map them to `inputTokens` and `outputTokens`. Do not enter `total_tokens` in both fields. Missing usage is unknown, not zero: check billing or usage logs. Output totals may include hidden reasoning or formatting tokens; do not add included details again.

For totals across requests, select Aggregated usage in the online calculator. Do not multiply by task count or add retries already included in those totals. Combine only billing categories for the same model and effective rates; calculate different rates separately, then sum them. Aggregated mode does not infer actual request counts or per-task costs.

The offline CLI still uses a per-task sample multiplied by planned task count: `inputTokens` and `outputTokens` are per-task values. Do not enter aggregates as a single-task sample and interpret `perTask` or `estimatedBillableRequests` as the actual cost per task or request count.

Reconcile ordinary input, cache reads, cache writes and retention periods as non-overlapping billing categories. If 3000 input tokens are confirmed to include 2000 cache reads and no writes, ordinary input is 1000. Do not bill all 3000 as ordinary input and then add the 2000 cached tokens. Check the protocol before applying this relationship to Anthropic or another gateway.

[Online field and unit guide](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_en_usage#usage-to-cost) · [OpenAI usage fields](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) · [Output token counts](https://developers.openai.com/api/docs/guides/token-counting) · [Cache usage](https://developers.openai.com/api/docs/guides/prompt-caching)

These are protocol and calculation notes, not completed Link calls or price guarantees.

## Count only billed retries

For 100 planned tasks and 8 retries of which only 3 were billed, enter **3%**, not 8%. Zero without logs is provisional, not evidence of zero cost. Each retry is assumed to use the same input/output tokens and rates as one planned task; calculate changed histories or model switches separately.

## Separate cache and tool fees

This tool accepts one input rate and one output rate. It does not identify **cache reads, cache writes, long-context tiers, images or tool fees**. Reconcile non-overlapping usage categories at their respective rates, then sum them. If total input tokens already include cache hits, do not add those cached tokens a second time.

Choosing a monthly plan also requires active days, eligible groups and daily overages. Daily Credits are not a fixed token quantity. Do not assume GPT/Claude monthly plans cover the separate Gemini group.

[Calculate online](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_en_calculator) · [Monthly plan comparison](monthly-plan-vs-payg.md) · [Current Link prices](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_en_pricing)
