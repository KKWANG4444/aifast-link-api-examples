# AIFast Link: LLM API cost calculator and integration examples

[简体中文](README.md) · [Online cost calculator](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_calculator) · [Get started](https://docs.aifast.link/en/start/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_start)

[Download offline examples](https://github.com/KKWANG4444/aifast-link-api-examples/releases/latest) · [Token cost formula and input fields](docs/en/token-cost.md)

A dedicated public example repository for **AIFast Link**, covering only `www.aifast.link` and `docs.aifast.link`. This is not an official project of OpenAI, Anthropic or Google.

Estimate token costs, account for **billed retries**, and compare pay-as-you-go with daily-allowance monthly plans before choosing a configuration. Link lists GPT, Claude and Gemini models; GPT / Claude plans apply to specified groups. **Do not assume those plans include the separate Gemini group.**

## Run locally without a key

Node.js 22 or newer. No packages to install, no account required, no network access or paid model calls in the calculator or tests.

Without Git, download the ZIP above, extract it, then run the same `node` commands from that directory.

```bash
git clone https://github.com/KKWANG4444/aifast-link-api-examples.git
cd aifast-link-api-examples
node scripts/cost.mjs token examples/token-cost.json
node scripts/cost.mjs plan examples/monthly-plan.json
node scripts/cost.mjs plan examples/monthly-plan-overage.json
node --test
```

All fixtures are **illustrative inputs, not current offers**:

| Example | Expected result |
| --- | --- |
| 1,000 tasks, 3,000 input / 800 output tokens, $2.50 / $10 per million tokens, 10% billed retries | $17.05 total |
| CNY 200 plan, 20 daily Credits, 20 active days using 10 Credits/day, CNY 12/day pay-as-you-go | CNY 240 pay-as-you-go versus CNY 200 plan |
| Same plan but 25 Credits/day, confirmed wallet fallback at CNY 0.70/Credit | CNY 270 including overages, more than pay-as-you-go |

Replace fixture values with your own prices and usage. No currency conversion is performed. Plan inputs are cash costs in CNY; Credits are internal usage units, not USD or a fixed token quantity.

The token example uses one input rate and one output rate. It does not automatically separate cache reads, cache writes, long-context tiers or tool fees. Reconcile those categories separately instead of treating this estimate as a complete bill.

## Practical guides

- [Token cost formula, billed retries and cache limits](docs/en/token-cost.md): field definitions and a reproducible $17.05 example.
- [OpenAI compatible API and SDK troubleshooting](docs/en/api-setup.md): Base URL, curl-versus-SDK differences, unsupported parameters, Codex Responses, Claude Code Messages and Gemini scope.
- [OpenAI-compatible API scope and endpoint limits](https://docs.aifast.link/en/topics/openai-compatible/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_compatibility): compare protocol paths and compatibility boundaries before switching clients.
- [API model-not-found troubleshooting](https://docs.aifast.link/en/troubleshooting/model-not-found/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_model_not_found): check the model ID, key access, endpoint and final request URL.
- [Codex custom provider setup](https://docs.aifast.link/en/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_codex): configure `config.toml`, the Responses API and tool-call checks.
- [Monthly plan versus pay-as-you-go](docs/en/monthly-plan-vs-payg.md): active days, daily limits, overages and idle time.
- [401 / 404 / 429 / streaming troubleshooting](docs/en/troubleshooting.md): isolate authentication, paths, quotas and interruptions.
- [Live model pricing](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_pricing) and [plan rules](https://docs.aifast.link/en/payment/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_payment): confirm eligibility before paying.

The OpenAI-compatible base is `https://www.aifast.link/v1`; Claude Code uses the origin `https://www.aifast.link` before the client appends its Messages path. Do not append `/v1` twice. Verify model access, protocol, streaming and tool calls independently.

For 100 planned tasks and 8 retries of which only 3 were billed, enter **3%**, not 8%. Each retry is assumed to have the same input/output token counts and unit prices as one planned task. Calculate different usage separately. Zero without logs is provisional, not evidence of zero retry cost.

## Verification and support

Public Link docs and catalog checked on 2026-10-14. Catalog presence does not establish availability for your key, model identity or a reliability SLA. This repository has not performed authenticated paid calls or charge verification. CI checks offline behavior and content boundaries only.

Report reproducible tool problems in [Issues](https://github.com/KKWANG4444/aifast-link-api-examples/issues). Never post keys, cookies, payment details or raw request logs. For account or billing questions use [Link support](https://www.aifast.link/customersupport?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_en_support).
