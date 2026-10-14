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

## Read the account model list first

Securely set `AIFAST_LINK_API_KEY` in your terminal before running this network request. It reads model access without generating content. Avoid shell tracing and never post authorization headers.

```bash
curl --fail-with-body --silent --show-error \
  --connect-timeout 10 --max-time 30 \
  https://www.aifast.link/v1/models \
  -H "Authorization: Bearer ${AIFAST_LINK_API_KEY:?Set a Link API key first}"
```

A successful list request does not verify Chat, Responses, Messages, streaming or tools. Follow the relevant client guide, then test a small task with a limited key. Generation can incur charges; no paid requests have been executed by this repository.

- [Codex custom provider](https://docs.aifast.link/en/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_codex)
- [Claude Code setup](https://docs.aifast.link/en/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_claude)
- [Gemini protocol scope](https://docs.aifast.link/en/providers/gemini-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_en_gemini)

Native Gemini `generateContent` uses different bodies, authentication and streaming events. A Gemini catalog entry cannot automatically replace a Messages model in Claude Code or a Responses model in Codex. Record sanitized paths, client versions, status and usage, not keys or private prompts. One successful request is not an availability guarantee.
