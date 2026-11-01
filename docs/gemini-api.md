# Gemini API 中转接入：模型 ID、OpenAI 兼容与计费检查

[English](en/gemini-api.md) · [返回仓库](../README.md) · [Link Gemini 完整教程](https://docs.aifast.link/providers/gemini-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gemini_zh_guide)

本指南由 AIFast Link 运营方维护，不是 Google 官方项目。2026-11-02 核对了 Link 公开目录：Gemini 使用独立分组，声明 OpenAI 兼容和 Gemini 原生接口。**公开上架、下面的离线测试，都不等于你的 Key 有权限或模型已调用成功。** 没有执行带 Key 的付费验收。

## 先选协议，再填写地址

| 你的客户端 | Link 请求路径 | 请求体 | 检查边界 |
| --- | --- | --- | --- |
| OpenAI 兼容聊天客户端 | `/v1/chat/completions`，Base URL 为 `https://www.aifast.link/v1` | `messages` | 先验证非流式短文本；工具、图像、流式另测 |
| Gemini 原生客户端 | 目录声明 `/v1beta/models/{model}:generateContent` | `contents`、`parts` | Link 原生认证和参数未实测，不能直接复用下方兼容命令 |
| Codex / Claude Code | 分别使用 Responses / Messages | 不同协议 | Gemini 目录出现不等于可以直接替换客户端默认模型 |

Google 官方兼容地址是 `https://generativelanguage.googleapis.com/v1beta/openai/`，与 Link 的账号和账单分开。**Link Key 只发给 Link，Google Key 只发给 Google。** 两套协议不能只改 URL 而保留另一套请求体。

协议依据：[Google OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)、[Google generateContent](https://ai.google.dev/api/generate-content)。官方协议说明不证明 Link 支持全部参数。

## 第一步：不联网检查模型 ID

Node.js 22 或以上，在仓库根目录运行。此步骤不读取环境变量、API Key，也不联网。

```bash
node scripts/check-model.mjs examples/gemini/models.demo.json gemini-2.5-flash
```

预期输出：

```json
{"found":true,"checkedModelCount":1,"scope":"local-snapshot-only"}
```

[models.demo.json](../examples/gemini/models.demo.json) 是人为构造的测试数据，**不是当前账号返回结果**。改成 `gemini-2.5-Flash` 应得到 `found:false`、退出码 2，证明大小写必须匹配。退出码 0 只表示本地快照包含这个 ID；退出码 1 表示输入无效，不能当作“模型不存在”。

实际排查时，用同一个 Key、域名和分组查询 `/v1/models`，只保留 JSON 的 `data[].id` 并存到仓库外的私有文件，再替换命令的文件路径。不要把 Authorization、Cookie、Key、用户提示词或真实账号文件提交到 GitHub。工具拒绝 HTML、错误对象、价格目录和超过 1 MiB 的文件，不会替你自动脱敏。

找到 ID 后，仍需核对当前权限、协议、价格和快照时间；空列表或找不到 ID 不代表模型在所有账号都已下架。

## 第二步：手动发送一次短请求

[chat-request.json](../examples/gemini/chat-request.json) 是可编辑的请求体。先替换成同一 Key 可见的模型 ID，并在自己的终端安全设置 `AIFAST_LINK_API_KEY`。这一步会联网，可能产生费用，不属于离线检查。

```bash
curl --fail-with-body --silent --show-error \
  --connect-timeout 10 --max-time 60 \
  https://www.aifast.link/v1/chat/completions \
  -H "Authorization: Bearer ${AIFAST_LINK_API_KEY:?Set AIFAST_LINK_API_KEY locally before running}" \
  -H "Content-Type: application/json" \
  --data-binary @examples/gemini/chat-request.json
```

命令仅尝试一次，缺少 Key 时不会发送。不要开 `--verbose` 或分享含密钥的终端截图。60 秒只是客户端时限，超时不代表服务端未处理或未计费；先查用量再决定是否重试。

验收至少记录：HTTP 状态、是否有有效 `choices` 内容、返回的模型字段、`usage` 和对应 Link 用量账单。返回模型名不能证明底层身份；一次短文本通过也不证明长上下文、工具或流式通过。

## 第三步：用真实账单比较成本

Gemini 不默认包含在 GPT / Claude 月卡中。先在 [Link 模型广场](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gemini_zh_pricing)核对模型与分组；2026-11-02 的公开 Gemini 条目采用阶梯表达式计费，不能把单个倍率当成最终价格。

单一输入、输出费率的文本任务可使用 [免费 API 成本计算器](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gemini_zh_cost#usage-to-cost)；有缓存、长上下文阶梯、思考输出或工具费用时，按账单类别分别核对。不要只比较模型列表中的一个数字，也不要把 Token 总数同时算进输入和输出。

遇到 `401`、`404`、`model not found` 或 `429` 时，先看[按症状排错](troubleshooting.md)。路径或模型名错误不能靠充值解决，不要无限重试。
