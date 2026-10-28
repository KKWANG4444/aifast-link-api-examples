# Codex 自定义 Provider：Link 配置、401 与文件验收

[返回首页](../README.md) · [English](en/codex-provider.md)

## 先下载，不修改默认提供商

这组模板只对应 AIFast Link。没有安装脚本，不读取本机凭据，不自动联网，也不证明某个模型已经通过 Codex 实测。配置方法核对于 2026-10-28；模型权限与支持协议仍应实时确认。

- [Provider 定义](../examples/codex/provider.toml)：核对后合并进用户级 `~/.codex/config.toml`，保留其他内容。
- [Link Profile](../examples/codex/aifast_link.config.toml)：在 `~/.codex/aifast_link.config.toml` 使用，只替换 `YOUR_MODEL_ID`。
- [最小文件任务](../examples/codex/task.txt)：只在不含客户代码的临时 Git 仓库运行。

若已设置 `CODEX_HOME`，使用实际配置目录。已有同名配置时先比较，不覆盖整份文件；不要把 Provider 放入项目 `.codex/config.toml`。本模板不修改默认 `model_provider`，只通过 `--profile aifast_link` 选择 Link。

先在本地安全设置独立限额 Key 对应的 `AIFAST_LINK_API_KEY`，不要把 Key 写进示例文件、Git 或 Issue。CLI 执行模型任务可能计费，离线测试不计费。

```bash
(
  set -e
  : "${AIFAST_LINK_API_KEY:?Set AIFAST_LINK_API_KEY locally before running}"
  codex --version
  mkdir codex-link-check
  cd codex-link-check
  git init
  codex --strict-config --profile aifast_link
)
```

缺少 Key、目录已存在或初始化失败时，上面的子 Shell 会停止，不会启动任务。`YOUR_MODEL_ID` 必须换成账号有权限、且支持 Responses 的模型，不能凭目录上架推断可用。

## 怎么判断文件任务通过

在 Codex 中执行 `task.txt` 的任务；退出会话后，进入刚创建的 `codex-link-check` 目录，再执行以下只读检查：

```bash
git status --short --untracked-files=all
git diff --exit-code
git diff --cached --exit-code
node -e 'const fs = require("node:fs"); const text = fs.readFileSync("hello.txt", "utf8"); if (text !== "connection ok\n") process.exit(1); console.log("FILE_CONTENT_OK");'
```

预期是状态只显示 `?? hello.txt`、两个 diff 命令退出码为 0，文件检查输出 `FILE_CONTENT_OK`。这些是预期结果，不是一次真实 Link 模型调用记录。新建文件未跟踪时 `git diff` 为空是正常的；缺文件、内容不符或额外改动都不能算通过。

本仓库的 `node --test` 通过人工构造的临时文件验证上述 Git 行为和文件断言，**不会启动 Codex 或调用模型**。文件正确也不能单独证明 Provider、模型身份、流式事件或计费正确。

## 按症状排查

| 现象 | 先检查 | 不要误判 |
| --- | --- | --- |
| 仍请求旧地址 | `--profile aifast_link`、Provider ID、实际 `CODEX_HOME` 与请求域名 | UI 模型名不是请求路由证据 |
| 401 | 同一终端的 `AIFAST_LINK_API_KEY` 与 Link 令牌状态 | ChatGPT 已登录不等于 Link Key 已认证 |
| 404 或 HTML | Base URL 为 `https://www.aifast.link/v1`，最终路径为 `/v1/responses` | 不填 Docs 域名，不重复 `/v1` |
| 对话成功，工具失败 | Responses 工具事件、工具输出与结束状态 | Chat Completions 成功不等于 Codex 验收通过 |
| `git diff` 空白 | `git status --short --untracked-files=all` 和实际文件内容 | 未跟踪文件不会出现在普通 diff 中 |

## 保留哪些运行证据

只公开脱敏的测试日期、CLI 版本、选用 Profile、模型 ID、最终请求主机及路径、工具事件类型和文件检查结果。删除 Key、认证头、Cookie、个人目录、提示词及客户代码。费用以账单为准，长任务、恢复和压缩应另测。

[Link 完整 Codex 教程及官方参考](https://docs.aifast.link/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=codex_zh_setup) · [逐项验收与排错](https://docs.aifast.link/troubleshooting/codex-gateway-checklist/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=codex_zh_checks) · [按实际用量估算任务成本](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=codex_zh_cost)
