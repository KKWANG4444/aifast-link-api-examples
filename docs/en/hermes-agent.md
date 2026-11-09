# Hermes Agent custom API: Link template and key-free checks

[简体中文](../hermes-agent.md) · [Full Link guide](https://docs.aifast.link/en/tools/hermes-agent/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=hermes_en_guide)

A named Hermes provider separates the Link endpoint, transport and key variable. This example covers only Chat Completions: Base URL `https://www.aifast.link/v1`, expected path `/v1/chat/completions`. Responses, Messages, tool calls and account model access require separate checks.

## Check the template without installing Hermes

Requires Node.js 22 or later. No dependencies, network requests, environment-secret reads, Hermes launch or personal configuration changes.

```bash
node scripts/hermes-config.mjs
node --test test/hermes-config.test.mjs
```

The [JSON template](../../examples/hermes/config.template.json) is valid YAML syntax. It contains only `providers.aifast_link`, leaving the global default model unchanged. In a separate copy, replace `YOUR_MODEL_ID` with a candidate model ID and run `node scripts/hermes-config.mjs path/to/template.json`. This checker accepts only the example's fields; it is not a general Hermes configuration validator. Never supply personal configuration or secrets.

A successful check returns `scope: offline-template-only`, `modelIsPlaceholder` and `liveCallVerified: false`. Exit code 0 means the fields meet this example's constraints, not that the model exists, authentication succeeds or a paid request works.

## Configure Hermes after reviewing the settings

Merge the template fields into the active `config.yaml` while keeping other providers. Review an existing entry with the same name before editing. `key_env` holds only the name `AIFAST_LINK_API_KEY`; configure the actual key through local secret management, never Git.

Set the following model fields only when deliberately selecting Link, after replacing the model ID. This changes the active profile's model selection:

```yaml
model:
  default: YOUR_MODEL_ID
  provider: custom:aifast_link
```

Alternatively, run `hermes model` in a terminal for initial setup. The in-chat `/model` switches configured models, not initial credentials. The legacy `custom_providers` structure remains supported; check the installed version before migrating.

`HERMES_HOME` selects configuration and state, not an operating-system sandbox. Tool subprocesses may access the real HOME and CLI credentials. Check auxiliary routes such as compression, titles and vision separately; selecting Link for the main conversation does not prove all auxiliary requests use Link.

## Acceptance and cost boundaries

Official configuration references checked on 2026-11-09. No authenticated calls were made with this template. Future live checks should record client version, model ID, final host and path, text output, tool results, stream completion, charges and failures. Plain-text success is not tool or billing verification. Never publish keys, cookies or raw request logs.

Agent retries and tool loops can add usage. Compare active days, daily allowances, overages and wallet fallback with the [offline cost examples](monthly-plan-vs-payg.md). Fixture values are not Link prices, and a monthly plan is not unlimited usage.

Official references: [provider configuration](https://hermes-agent.nousresearch.com/docs/integrations/providers) and [configuration precedence and directories](https://hermes-agent.nousresearch.com/docs/user-guide/configuration). Client protocol support does not establish support for every model on Link.
