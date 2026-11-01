# Gemini API gateway setup: model IDs, OpenAI compatibility and billing

[简体中文](../gemini-api.md) · [Repository](../../README.en.md) · [Full Link Gemini guide](https://docs.aifast.link/en/providers/gemini-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gemini_en_guide)

Maintained by the AIFast Link operator, not an official Google project. Link's public catalog checked on 2026-11-02 declares a separate Gemini group and OpenAI-compatible and Gemini-native endpoints. **Catalog presence and the offline checks below do not prove access for your key or a successful model call.** No authenticated paid acceptance test was performed.

## Choose the protocol first

| Client | Link request path | Payload | Verification boundary |
| --- | --- | --- | --- |
| OpenAI-compatible chat client | `/v1/chat/completions`, Base URL `https://www.aifast.link/v1` | `messages` | Start with non-streaming short text; test tools, images and streaming separately |
| Native Gemini client | Catalog declares `/v1beta/models/{model}:generateContent` | `contents`, `parts` | Link native authentication and parameters are not live-tested; do not reuse the command below |
| Codex / Claude Code | Responses / Messages respectively | Different protocols | A Gemini catalog entry does not make it a drop-in replacement for a client model |

Google's official compatibility URL is `https://generativelanguage.googleapis.com/v1beta/openai/`. Its account and billing are separate from Link. **Send Link keys only to Link, and Google keys only to Google.** Changing a URL does not convert the request body to another protocol.

Protocol references: [Google OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai), [Google generateContent](https://ai.google.dev/api/generate-content). Official protocol documentation does not prove that Link supports every parameter.

## Step 1: check a model ID offline

Requires Node.js 22 or later. Run from the repository root. This step does not read environment variables or API keys and makes no network requests.

```bash
node scripts/check-model.mjs examples/gemini/models.demo.json gemini-2.5-flash
```

Expected result:

```json
{"found":true,"checkedModelCount":1,"scope":"local-snapshot-only"}
```

[models.demo.json](../../examples/gemini/models.demo.json) is synthetic test data, **not a response from your account**. Using `gemini-2.5-Flash` returns `found:false` and exit code 2 because IDs are case-sensitive. Exit code 0 means only that the local snapshot contains the ID. Exit code 1 means invalid input, not a missing model.

For a real investigation, query `/v1/models` using the same key, host and group. Retain only JSON `data[].id` in a private file outside the repository, then use that file path in the command. Never commit Authorization, cookies, keys, prompts or real account files. The tool rejects HTML, error objects, pricing catalogs and files larger than 1 MiB; it does not automatically redact your input.

Even a match requires checking current permissions, protocol, price and snapshot age. An empty list or missing ID does not establish retirement across all accounts.

## Step 2: manually send one short request

Edit [chat-request.json](../../examples/gemini/chat-request.json) to use an ID visible with the same key, and securely set `AIFAST_LINK_API_KEY` in your own terminal. This step uses the network and may incur charges; it is not part of the offline check.

```bash
curl --fail-with-body --silent --show-error \
  --connect-timeout 10 --max-time 60 \
  https://www.aifast.link/v1/chat/completions \
  -H "Authorization: Bearer ${AIFAST_LINK_API_KEY:?Set AIFAST_LINK_API_KEY locally before running}" \
  -H "Content-Type: application/json" \
  --data-binary @examples/gemini/chat-request.json
```

The command attempts once and stops before sending if the key is absent. Do not enable `--verbose` or share screenshots containing keys. The 60-second client timeout is not a service promise or proof that server processing or billing stopped. Check usage before retrying.

Record the HTTP status, valid `choices` content, returned model field, `usage` and corresponding Link billing record. The returned name does not prove model identity. One short-text success does not establish long-context, tool or streaming support.

## Step 3: compare costs using actual billing

Do not assume GPT / Claude monthly plans include Gemini. Check the model and group in [Link pricing](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gemini_en_pricing). Public Gemini entries on 2026-11-02 use tiered-expression billing; a single ratio is not the final price.

Use the [free API cost calculator](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gemini_en_cost#usage-to-cost) for text tasks with one input rate and one output rate. Reconcile caching, long-context tiers, thinking output and tool charges by billing category. Do not compare only one catalog number or count total tokens as both input and output.

For `401`, `404`, `model not found` or `429`, use the [symptom-based checklist](troubleshooting.md). Topping up does not fix a wrong path or model name. Avoid unlimited retries.
