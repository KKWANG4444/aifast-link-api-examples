# Link API: 401, 404, 429 and interrupted streams

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

[Base URL checker](https://docs.aifast.link/en/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_en_baseurl) · [Link troubleshooting guide](https://docs.aifast.link/en/troubleshooting/api-errors/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_en_guide)
