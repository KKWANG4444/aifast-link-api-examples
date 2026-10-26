# Link API 接入：Base URL、Claude Code、Codex 与 Gemini

[返回首页](../README.md) · [English](en/api-setup.md)

## 先确定账号、模型和协议

使用 Link 创建的限额 Key，不混用模型厂商或其他站点的 Key。模型 ID 从当前账号可见模型列表复制，不根据宣传名称猜测。公开目录列出某个模型，不代表该 Key 有访问权限。

| 客户端 | Base URL | 最终请求路径 | 核对事项 |
| --- | --- | --- | --- |
| OpenAI 兼容聊天 | `https://www.aifast.link/v1` | `/v1/chat/completions` | messages、model、stream |
| Codex | `https://www.aifast.link/v1` | `/v1/responses` | Responses 事件、工具输出 |
| Claude Code | `https://www.aifast.link` | `/v1/messages` | Anthropic 认证、模型映射、流式事件 |
| Gemini 兼容聊天 | `https://www.aifast.link/v1` | `/v1/chat/completions` | Gemini 分组与具体型号能力 |

Claude Code 使用 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN` 和模型配置；Codex 使用自定义 Provider 的 `base_url`、`env_key` 和 Responses 协议。不要把一套客户端的变量复制给另一套。

## OpenAI Compatible API 与 SDK 兼容性怎么核对

OpenAI Compatible API 指约定范围内的请求与响应兼容，不是所有 OpenAI 产品、模型参数或客户端功能都能直接互换。GPT、Claude、Gemini 的目录名称也不是协议保证；Link 需要按具体模型、分组和端点逐项验证。

| 遇到的问题 | 核对顺序 | 下一步 |
| --- | --- | --- |
| SDK 配好但收到 404 或 HTML | 实际域名、最终路径、是否出现 `/v1/v1` | 聊天的 Base URL 是 `https://www.aifast.link/v1`，不要填写文档网址或完整 `/chat/completions` 路径后再让 SDK 追加 |
| curl 成功，SDK 仍失败 | 是否使用同一个 Key、模型和协议，再记录 SDK 版本、代理和额外参数 | 对照一个最小文本请求；curl 的 Chat 成功不能证明 SDK 的 Responses 成功 |
| 400 或 unsupported parameter | 错误正文指向哪个参数，所选模型是否支持 | 一次只调整一个可选参数，不悄悄移除业务必须的工具或输出格式要求 |
| 普通回复成功，流式或工具失败 | stream、结束事件、工具参数与结果回传 | 按实际协议单独验收，不把一次普通请求当成完整 SDK 兼容 |

Python 客户端常用 `base_url`，JavaScript 客户端常用 `baseURL`；字段以已安装 SDK 的接口为准，不要混用语言示例。排错记录应包含 SDK 版本、最终路径、模型 ID、HTTP 状态和脱敏错误代码，不包含 API Key。

[Link OpenAI Compatible API 范围](https://docs.aifast.link/topics/openai-compatible/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_zh_compatibility) · [逐协议能力矩阵](https://docs.aifast.link/reference/api-compatibility/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_zh_matrix) · [model not found 与认证排查](troubleshooting.md)

## 先做不生成内容的模型列表检查

先在自己的终端安全设置 `AIFAST_LINK_API_KEY`。下面的命令会联网读取账号可见模型，不生成内容；不要开启 shell 跟踪或把带认证的日志贴进 Issue。

```bash
curl --fail-with-body --silent --show-error \
  --connect-timeout 10 --max-time 30 \
  https://www.aifast.link/v1/models \
  -H "Authorization: Bearer ${AIFAST_LINK_API_KEY:?先设置 Link API Key}"
```

模型列表成功只证明这一请求通过，不能证明 Chat、Responses、Messages、SSE 和工具调用全部正常。继续按目标客户端教程使用临时限额 Key 验证一条短任务；生成请求可能产生实际费用。本仓库没有替你执行付费请求。

## 按工具继续

- [Link Codex 自定义 Provider 配置](https://docs.aifast.link/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_zh_codex)
- [Link Claude Code 认证与路径配置](https://docs.aifast.link/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_zh_claude)
- [Link Gemini 兼容与原生协议边界](https://docs.aifast.link/providers/gemini-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=setup_zh_gemini)

Gemini 原生 `generateContent` 与 Chat Completions 的请求结构、认证和流式事件不同。目录声明支持不等于每项功能已验收；不要把 Gemini 模型直接替代 Claude Code 的 Messages 或 Codex 的 Responses 模型。

## 记录有效证据

只保存脱敏后的最终域名和路径、客户端版本、模型 ID、HTTP 状态、协议类型及账单用量。不要公开认证头、个人提示词或支付信息。配置成功、一次请求成功和长期可用性是三个不同结论。
