# AIFast Link API setup: Base URL, Claude Code, Codex and Gemini

[Home](../../README.en.md) · [简体中文](../api-setup.md)

Use a limited Link API key, not credentials issued by a model vendor or another service. Select a model ID available to your account. Public catalog presence does not prove your key has access.

| Client | Base URL | Final path | Verify |
| --- | --- | --- | --- |
| OpenAI-compatible chat | `https://www.aifast.link/v1` | `/v1/chat/completions` | messages, model, streaming |
| Codex custom provider | `https://www.aifast.link/v1` | `/v1/responses` | Responses events and tools |
| Claude Code | `https://www.aifast.link` | `/v1/messages` | Anthropic authentication and model mapping |
| Gemini compatible chat | `https://www.aifast.link/v1` | `/v1/chat/completions` | Gemini group and model capabilities |

Claude Code uses `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN` and model configuration. Codex uses provider `base_url`, `env_key` and the Responses protocol. Do not interchange client environment variables or append `/v1` twice.

## OpenAI compatible API: SDK compatibility issues

An OpenAI compatible API supports a defined set of request and response behaviors. It does not mean every OpenAI product, model parameter or client feature is interchangeable. On Link, check the selected GPT, Claude or Gemini model, group and endpoint separately.

| Symptom | Check first | Next step |
| --- | --- | --- |
| SDK returns 404 or HTML | Actual host, final path and duplicated `/v1/v1` | Use `https://www.aifast.link/v1` for compatible chat, not a docs URL or a complete `/chat/completions` path that the SDK appends again |
| curl works but the SDK fails | Same key, model and protocol; SDK version, proxy and added parameters | Compare one minimal text request. A curl Chat request does not validate an SDK Responses request |
| 400 or unsupported parameter | Error details and support in the selected model | Change one optional field at a time; do not silently drop required tools or output-format constraints |
| Text works but streams or tools fail | Stream handling, terminal events, arguments and tool-result continuation | Validate each protocol and feature separately; one text response is not full SDK compatibility |

Python clients commonly use `base_url`; JavaScript clients commonly use `baseURL`. Check the interface of the installed SDK instead of mixing language examples. Record the SDK version, final path, model ID, HTTP status and redacted error code, never the API key.

[Link compatibility scope](https://docs.aifast.link/en/topics/openai-compatible/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_compatibility) · [Protocol compatibility matrix](https://docs.aifast.link/en/reference/api-compatibility/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_matrix) · [Model-not-found and authentication checks](troubleshooting.md)

<a id="sdk-request-fixture"></a>

## Inspect requests built by the official SDK offline

This fixture pins the official Node SDK to `openai@7.53.0`. A local replacement handles the SDK's `fetch`, recording only the URL, method and fixed example body. It does not read real keys or send network requests. **It does not prove live Link compatibility**; it shows why Chat and Responses remain different requests even with the same Base URL.

Run from the repository root. Dependency installation connects to npm; the installed example and its tests run offline. The cost calculator still needs no dependency installation.

```bash
npm ci --prefix examples/sdk --ignore-scripts
node examples/sdk/capture-request.mjs chat
node examples/sdk/capture-request.mjs responses
npm test --prefix examples/sdk
```

| Mode | Expected final path | Fixed example fields |
| --- | --- | --- |
| chat | `/v1/chat/completions` | `model`, `messages`, `stream: false` |
| responses | `/v1/responses` | `model`, `input`, `stream: false` |

Source: [offline request capture](../../examples/sdk/capture-request.mjs). `YOUR_MODEL_ID` is a placeholder; `fixtureOnly: true` means no model was tested. Do not present this output as a live success report. A regression case also shows how a full endpoint in `baseURL` causes `/chat/completions` to be appended twice.

The [three raw request records](../../examples/sdk/observed-requests.json), captured locally on 2026-11-11, cover Chat, Responses and an incorrectly duplicated endpoint. They explicitly set `liveCallVerified: false`. Tests rebuild and compare the requests using the same pinned SDK without reading real keys or contacting Link. No account is needed to inspect, download or reproduce them; the fixture response is not a live-call result.

[Compare the paths and fields in Link Docs](https://docs.aifast.link/en/reference/api-compatibility/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_fixture_result#sdk-offline-result)

Official option mapping: Python uses `base_url`, `max_retries=0` and `timeout=30.0` (seconds); Node uses `baseURL`, `maxRetries: 0` and `timeout: 30000` (milliseconds). SDK retries are separate from application-level retries; disable the outer retry loop while diagnosing too.

References: [OpenAI Node SDK](https://github.com/openai/openai-node) and [OpenAI Python SDK](https://github.com/openai/openai-python). Source and local fixtures establish request construction, not provider availability, model identity or billing behavior.

## Read the account model list first

Securely set `AIFAST_LINK_API_KEY` in your terminal before running this network request. It reads model access without generating content. Avoid shell tracing and never post authorization headers.

```bash
curl --fail-with-body --silent --show-error \
  --connect-timeout 10 --max-time 30 \
  https://www.aifast.link/v1/models \
  -H "Authorization: Bearer ${AIFAST_LINK_API_KEY:?Set a Link API key first}"
```

A successful list request does not verify Chat, Responses, Messages, streaming or tools. Follow the relevant client guide, then test a small task with a limited key. Generation can incur charges; no paid requests have been executed by this repository.

- [Download Codex provider, profile and file-check templates](codex-provider.md)
- [Codex custom provider](https://docs.aifast.link/en/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_codex)
- [Claude Code setup](https://docs.aifast.link/en/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_claude)
- [Gemini protocol scope](https://docs.aifast.link/en/providers/gemini-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_gemini)

Native Gemini `generateContent` uses different bodies, authentication and streaming events. A Gemini catalog entry cannot automatically replace a Messages model in Claude Code or a Responses model in Codex. Record sanitized paths, client versions, status and usage, not keys or private prompts. One successful request is not an availability guarantee.
