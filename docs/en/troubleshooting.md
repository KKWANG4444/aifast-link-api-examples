# Link API: model not found, 401, 404, 429 and interrupted streams

[Home](../../README.en.md) · [简体中文](../troubleshooting.md)

| Symptom | Check first | Do not assume |
| --- | --- | --- |
| 401 | Link key validity, protocol-specific authentication, disabled keys | Authentication failure is not proof of an outage |
| 404 or HTML | Final path, duplicated `/v1`, website URL versus API URL | Replacing keys cannot repair a wrong path |
| Model not found | Exact account-visible ID and eligible group | A public listing does not grant every key access |
| 429 | Balance, daily allowance, concurrency, rate limits and error details | Do not retry indefinitely or assume rate limiting alone |
| 502 / 503 / timeout | Request ID, gateway status and billing records | Client timeout does not prove no execution or no charge |
| Interrupted SSE | Client version, proxy timeout, completion event and final usage | Partial output is not a completed task |

Use bounded retries with backoff. Inspect usage and request status after timeouts to avoid duplicate charges. Remove credentials, cookies, private prompts and account details before sharing diagnostics.

## Model not found: check the ID, key access and protocol

`model not found` can mean an incorrect ID, an unavailable group for the key, or an unsupported protocol. HTTP 404 alone does not identify the cause. Repeating the same request will not fix those settings.

1. **Check the actual request URL.** The OpenAI-compatible base is `https://www.aifast.link/v1`. Avoid `/v1/v1`; if the response is HTML, check for a documentation URL, a website route or a duplicated endpoint.
2. **Inspect the model list with the same failing key.** Use the [bounded model-list request in the setup guide](api-setup.md) to read `/v1/models`, then compare the exact ID, case and suffix. Do not post the key in an Issue or substitute another account's model list.
3. **If the model is absent, check the group instead of guessing aliases.** Confirm key permissions, group selection and plan eligibility. Gemini uses a separate group; a GPT / Claude plan does not imply Gemini access. A 401 from the list is an authentication error, not an empty model list.
4. **If the model is present, check the protocol.** Codex uses Responses, Claude Code uses Messages, and compatible chat clients commonly use Chat Completions. A listed ID does not establish support for all three. A successful `/v1/models` request does not verify generation or tool calls.
5. **Keep useful, redacted evidence.** Record the client version, request path, model ID, HTTP status, error code and request ID for Link support. Do not publish keys, authorization headers, private prompts or complete account responses. Retrying generation may incur charges.

[Link model-not-found checklist](https://docs.aifast.link/en/troubleshooting/model-not-found/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_en_model_not_found) · [Protocol compatibility matrix](https://docs.aifast.link/en/reference/api-compatibility/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_en_protocols)

[Base URL checker](https://docs.aifast.link/en/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_en_baseurl) · [Link troubleshooting guide](https://docs.aifast.link/en/troubleshooting/api-errors/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_en_guide)
