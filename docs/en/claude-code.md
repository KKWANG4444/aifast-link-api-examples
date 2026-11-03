# Claude Code custom API: ANTHROPIC_BASE_URL, 401 and endpoint checks

[Repository](../../README.en.md) · [简体中文](../claude-code.md)

For AIFast Link only. Configuration references reviewed on November 3, 2026. These are templates, not successful request records. Downloading and validating JSON requires no API key; starting a client task or sending a real request may incur charges.

## Download and review

- [Configuration without credentials](../../examples/claude-code/settings.template.json): contains the Link origin and a model placeholder. Merge only the necessary fields according to the official configuration guide; preserve existing settings.
- [Minimal Messages request](../../examples/claude-code/messages.json): replace the model placeholder and use `POST https://www.aifast.link/v1/messages`. Test streaming and tools separately after a short text request succeeds.

Choose a Claude model ID available to your current Link key. Configure the credential privately; never add it to the repository templates. `ANTHROPIC_AUTH_TOKEN` uses Bearer authentication, while `ANTHROPIC_API_KEY` uses `x-api-key`. Follow the gateway's requirements and avoid conflicting values.

## Which Base URL belongs here?

| Configuration | Result or risk | Link configuration |
| --- | --- | --- |
| `https://www.aifast.link` | The client appends `/v1/messages` | Claude Code Anthropic Base URL |
| `https://www.aifast.link/v1` | Appending `/v1/messages` duplicates `/v1` | Use the origin and verify the final path |
| `https://www.aifast.link/v1/chat/completions` | An OpenAI chat endpoint, not an Anthropic base URL | Verify the protocol; changing a model name is insufficient |

## Why does the old endpoint remain active?

Record `claude --version`, then check the active base URL and credential source using `/status` inside Claude Code. Settings-file `env` values can override shell exports, and an editor launched from the desktop may not inherit your terminal environment. Identify the source before changing it. Preserve unrelated settings and do not publish screenshots containing credentials.

| Symptom | Check first | Evidence to keep |
| --- | --- | --- |
| 401 | Host, credential owner, header and configuration conflicts | Sanitized error and active credential source |
| 404 or HTML | Final `/v1/messages` path | Status, Content-Type and request path |
| model not found | Model ID and group available to the current key | Same-account catalog; names do not prove identity |
| Text works but tools fail | SSE events, tool arguments and tool results | Completed task output, separately from a text probe |
| Plan allowance remains but requests fail | Group, daily allowance and billing preference | Current account terms and usage records |

## Keep a reviewable result

Record the date, client version, final host/path, model ID, status, stream completion, actual tool execution and billed usage. Sanitize the record and mark untested items as untested. Official gateway documentation is a reference, not an endorsement of Link.

[Full setup and official references](https://docs.aifast.link/en/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_en_setup) · [Pay-as-you-go and monthly plans](https://docs.aifast.link/en/payment/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_en_payment) · [Estimate usage costs](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_en_cost)
