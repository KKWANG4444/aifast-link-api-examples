# Claude Code 自定义 API：ANTHROPIC_BASE_URL、401 与路径排查

[仓库首页](../README.md) · [English](en/claude-code.md)

本页只对应 AIFast Link。2026-11-03 核对官方配置说明，模板是待填示例，不是成功调用记录。下载、JSON 校验不需要 API Key；启动客户端或发送真实请求可能产生费用。

## 先下载，再核对

- [无密钥配置模板](../examples/claude-code/settings.template.json)：只包含 Link 地址与模型占位值。按官方配置说明合并所需字段，保留原设置；不要直接替换整个配置文件。
- [最小 Messages 请求](../examples/claude-code/messages.json)：替换模型占位值，目标为 `POST https://www.aifast.link/v1/messages`。短文本成功后，再分别验证流式和工具调用。

从当前 Link 账号目录取得可用的 Claude 模型 ID。凭据由你在本地单独配置，不要填入仓库模板或提交到 Git。`ANTHROPIC_AUTH_TOKEN` 对应 Bearer，`ANTHROPIC_API_KEY` 对应 `x-api-key`，按实际网关要求选择；不要同时保留冲突值。

## Base URL 到底填什么？

| 配置内容 | 结果或风险 | Link 的填写方式 |
| --- | --- | --- |
| `https://www.aifast.link` | 客户端追加 `/v1/messages` | Claude Code 的 Anthropic Base URL |
| `https://www.aifast.link/v1` | 若客户端继续追加 `/v1/messages`，会重复 `/v1` | 改为域名根地址并核对最终路径 |
| `https://www.aifast.link/v1/chat/completions` | 这是 OpenAI 聊天端点，不是 Anthropic Base URL | 先确认协议，不能仅更换模型名 |

## 配置了变量，为什么仍然走旧地址？

运行 `claude --version` 留下版本号，在 Claude Code 内运行 `/status` 核对生效的 Base URL 和认证来源。设置文件中的 `env` 可能覆盖 Shell；从桌面启动的编辑器未必继承当前终端变量。先定位来源再改，不覆盖整个配置，也不要公开包含凭据的配置截图。

| 现象 | 最先核对 | 验收证据 |
| --- | --- | --- |
| 401 | 目标域名、凭据归属、认证头和冲突设置 | 脱敏错误、实际认证来源 |
| 404 或 HTML | 最终路径是否 `/v1/messages` | 状态码、Content-Type、请求路径 |
| model not found | 当前 Key 对应模型 ID 和分组 | 同账号的模型目录，不能仅凭名称判断身份 |
| 文本正常但工具失败 | SSE 事件、工具参数、工具结果 | 真实任务结果，不能用短文本代替 |
| 月卡还有额度却不能调用 | 模型分组、当日额度、扣费偏好 | 当前账号套餐规则与账单 |

## claude-fable-5-2：目录上架不等于所有月卡可用

2026-11-11 的 [Link 公开目录记录](../examples/claude-code/catalog-observation.json)列出 `claude-fable-5-2`，声明接口为 `anthropic` 与 `openai`，分组为“Claude Code 稳定分组”和“Claude Code 专属分组”。这是无密钥目录查询，不是模型调用、身份或计费测试。

使用同一个 Link 账号核对 Key、模型与套餐分组。月卡有剩余额度但请求失败，先检查分组匹配；不要把所有 Claude 月卡视为相同权限，也不要通过反复充值排查路径错误。

[模型目录详情与当前价格](https://www.aifast.link/pricing/claude-fable-5-2?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_zh_fable) · [对应的中文接入说明](https://docs.aifast.link/providers/claude-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_zh_catalog#fable-5-2)

## 留下一份可复核结果
记录日期、客户端版本、最终域名/路径、模型 ID、状态码、流式是否完整、工具是否真正执行以及账单用量。只保留脱敏结果；没有验证的项写“未测”，不要写成通过。官方网关规范是核对依据，不是对 Link 的背书。

[完整配置与官方来源](https://docs.aifast.link/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_zh_setup) · [按量与月卡范围](https://docs.aifast.link/payment/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_zh_payment) · [计算使用成本](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=claude_zh_cost)
