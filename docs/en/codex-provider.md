# Codex custom provider: Link config, 401 errors and file checks

[Repository](../../README.en.md) · [简体中文](../codex-provider.md)

## Download without replacing your default provider

Requires Node.js 22+ and a stable Codex CLI release 0.134.0 or later. This template uses a separate profile file. Older versions use a different configuration structure; follow the official migration reference in the full guide before continuing. The startup check rejects old or unrecognized versions without upgrading software or overwriting configuration.

These templates are for AIFast Link only. They contain no installer, do not read credentials or make requests, and are not evidence of a successful model run. Configuration guidance checked on 2026-10-28; verify current model access and protocol support separately.

- [Provider definition](../../examples/codex/provider.toml): review and merge into user-level `~/.codex/config.toml`, preserving existing settings.
- [Link profile](../../examples/codex/aifast_link.config.toml): use as `~/.codex/aifast_link.config.toml` and replace `YOUR_MODEL_ID`.
- [Minimal file task](../../examples/codex/task.txt): run only in a temporary Git repository without customer code.

Use your actual configuration directory if `CODEX_HOME` is customized. Compare existing same-name settings before editing; do not replace whole files or put the provider in a project `.codex/config.toml`. The template leaves your default provider unchanged and selects Link through `--profile aifast_link`.

Set `AIFAST_LINK_API_KEY` securely in your terminal using a separate limited key. Never commit the key or paste it into an Issue. Running a model task can incur charges; offline tests do not.

```bash
(
  set -e
  : "${AIFAST_LINK_API_KEY:?Set AIFAST_LINK_API_KEY locally before running}"
  codex_version="$(codex --version)"
  node -e 'const m = /^codex-cli (\d+)\.(\d+)\.(\d+)(?:\s|$)/.exec(process.argv[1]); if (!m || !(Number(m[1]) > 0 || Number(m[2]) >= 134)) { console.error("Codex CLI 0.134.0+ stable required; review the migration guide first."); process.exit(1); }' "$codex_version"
  mkdir codex-link-check
  cd codex-link-check
  git init
  codex --strict-config --profile aifast_link
)
```

The subshell stops before starting a task if the key is missing, the directory already exists or initialization fails. Replace `YOUR_MODEL_ID` with an accessible model that supports Responses; a catalog listing alone does not establish access.

## Verify the file task

Give Codex the task in `task.txt`. After exiting, enter the newly created `codex-link-check` directory and run these read-only checks:

```bash
(
  set -e
  node <<'NODE'
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
const cwd = fs.realpathSync(".");
assert.equal(path.basename(cwd), "codex-link-check");
assert.equal(fs.realpathSync(git("rev-parse", "--show-toplevel").trim()), cwd);
assert.deepEqual(fs.readdirSync(".").sort(), [".git", "hello.txt"]);
assert.ok(fs.lstatSync(".git").isDirectory());
assert.ok(fs.lstatSync("hello.txt").isFile());
assert.equal(git("status", "--porcelain=v1", "--untracked-files=all", "--ignored", "-z"), "?? hello.txt\0");
git("diff", "--exit-code");
git("diff", "--cached", "--exit-code");
assert.equal(fs.readFileSync("hello.txt", "utf8"), "connection ok\n");
console.log("CODEX_FILE_CHECK_OK");
NODE
)
```

Run the complete block only at the root of the `codex-link-check` repository. It permits only `.git` and an untracked regular `hello.txt` file with the exact content and trailing newline. Any failed check exits nonzero; only a complete pass prints `CODEX_FILE_CHECK_OK`. These are expected results, not a recorded Link run. Empty ordinary `git diff` output does not rule out extra untracked files.

The repository's `node --test` checks this Git behavior and file assertion using synthetic temporary files. It **does not start Codex or call a model**. A correct file alone does not prove the provider, model identity, streaming events or billing.

## Troubleshoot by symptom

| Symptom | Check first | Avoid this assumption |
| --- | --- | --- |
| Requests still use an old endpoint | `--profile aifast_link`, provider ID, actual `CODEX_HOME` and request host | The displayed model name is not routing evidence |
| 401 | `AIFAST_LINK_API_KEY` in the launching terminal and the Link token status | ChatGPT sign-in does not authenticate a Link key |
| 404 or HTML | Base URL `https://www.aifast.link/v1`, final path `/v1/responses` | Do not use the Docs host or duplicate `/v1` |
| Text works but tools fail | Responses tool events, tool outputs and terminal status | Chat Completions success is not Codex acceptance |
| Empty `git diff` | `git status --short --untracked-files=all` and file contents | Untracked files are absent from ordinary diff |

## Keep reviewable evidence

Record the date, CLI version, selected profile, model ID, final host and path, tool event types and file-check results. Remove keys, authentication headers, cookies, personal directories, prompts and customer code before sharing. Reconcile charges with billing records; test long tasks, resume and compaction separately.

[Full Link Codex guide and official references](https://docs.aifast.link/en/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=codex_en_setup) · [Acceptance checklist](https://docs.aifast.link/en/troubleshooting/codex-gateway-checklist/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=codex_en_checks) · [Estimate task costs from your usage](https://docs.aifast.link/en/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=codex_en_cost)
