# GPT-6.2 Astra / Sol APIs: Link setup and group checks

[Home](../../README.en.md) · [简体中文](../gpt62-api.md)

On November 18, 2026, the AIFast Link public catalog lists `gpt-6.2-astra` and `gpt-6.2-sol` in the Codex stable and dedicated groups, with the `openai` endpoint declaration. The [catalog snapshot](../../examples/gpt62/catalog-observation.json) records the source, time and response hash without keys or account data.

This is not a model-call, identity or billing test. A catalog listing does not grant every key access or prove that every plan includes these models.

## From model ID to a minimal request

1. Use `https://www.aifast.link/v1` as the Base URL, not the Docs host, and avoid a duplicate `/v1`.
2. Query `/v1/models` with a separate limited Link key. Never send another provider's key to Link.
3. Confirm the exact ID in the current account's list before configuring the [SDK template](api-setup.md#sdk-request-fixture). Do not automatically replace production models.
4. Verify Chat Completions, Responses, SSE and tools separately. The `openai` catalog declaration does not prove that Codex `/v1/responses` or file tasks have passed.

[GPT-6.2 Astra details](https://www.aifast.link/pricing/gpt-6.2-astra?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_en_1) · [GPT-6.2 Sol details](https://www.aifast.link/pricing/gpt-6.2-sol?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_en_2) · [Separate Codex provider template](codex-provider.md)

## Estimate task costs before choosing usage billing or a plan

Check the current model, group, input/output and cache rates, then use the [API cost calculator](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_cost_en). Reconcile tiers, caching and additional tool fees separately. Do not reuse the old model's prices or plan eligibility. Monthly plans are not unlimited usage or model-vendor consumer subscriptions.

Repository examples run offline without calling a model. Live requests may incur charges; validate with a limited key and review billing before migration.

[Full setup guide and FAQ](https://docs.aifast.link/en/providers/openai-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_guide_en#gpt-6-2) · [Public catalog source](https://www.aifast.link/api/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_en_3)
