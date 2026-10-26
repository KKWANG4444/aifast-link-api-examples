# Link API：model not found、401、404、429 和流式中断排查

[返回首页](../README.md) · [English](en/troubleshooting.md)

| 现象 | 先核对 | 不应直接得出的结论 |
| --- | --- | --- |
| 401 | Link Key 是否有效、认证头与协议是否匹配、Key 是否被禁用 | 不能仅凭 401 判定服务宕机 |
| 404 或 HTML | 最终路径是否重复 `/v1`、是否误把网站首页当 API | 不应反复换 Key 掩盖路径错误 |
| model not found | 账号模型列表、精确 ID、适用分组 | 公开目录不保证每个 Key 都可用 |
| 429 | 余额、日额度、速率限制、客户端并发和错误正文 | 不要无限重试或假定只有限速 |
| 502 / 503 / 超时 | 请求 ID、网关和上游状态、是否已经有用量记录 | 客户端超时不保证服务端未执行或未计费 |
| SSE 提前断开 | 客户端版本、代理超时、事件结束标记、最终账单 | 部分文本返回不等于任务完整成功 |

重试应有限次数并退避；超时后先检查账单和请求状态，避免重复提交产生重复费用。排错记录应删除 Key、Cookie、个人提示词和账户信息。

## model not found：按模型 ID、Key 权限和协议逐项排查

`model not found` 不一定表示拼写错误，也可能是当前 Key 的分组不可用，或客户端请求了不支持的协议。不要只看 HTTP 404，也不要不断重试同一个请求。

1. **先核对实际请求地址。** OpenAI 兼容 Base URL 是 `https://www.aifast.link/v1`。最终路径不应出现 `/v1/v1`；收到 HTML 时，先排查是否误用了文档站、网页地址或重复端点。
2. **用出错的同一个 Key 检查模型列表。** 按[接入文档的限时模型列表命令](api-setup.md#先做不生成内容的模型列表检查)读取 `/v1/models`，逐字核对 ID 的大小写和后缀。不要把 Key 发到 Issue，也不要用另一个账号的可见列表代替。
3. **模型缺失时，核对分组而不是猜别名。** 检查该 Key 的模型权限、分组和套餐范围；Gemini 使用独立分组，不能假定 GPT / Claude 月卡可调用 Gemini。列表返回 401 时先解决认证，不把它当作“没有模型”。
4. **模型存在时，再检查协议。** Codex 使用 Responses，Claude Code 使用 Messages，普通兼容聊天通常使用 Chat Completions。列表中存在同名模型，不等于三个接口都支持它；`/v1/models` 成功也不是生成请求或工具调用成功的证明。
5. **仍失败时保留可核对证据。** 记录客户端版本、脱敏后的路径、模型 ID、HTTP 状态、错误代码与请求 ID，交给 Link 客服核查。不要公开 Key、认证头、个人提示词或完整账户响应；重新发起生成请求可能计费。

[Link model not found 专项排查](https://docs.aifast.link/troubleshooting/model-not-found/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_zh_model_not_found) · [协议能力矩阵](https://docs.aifast.link/reference/api-compatibility/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_zh_protocols)

[检查 Base URL](https://docs.aifast.link/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_zh_baseurl) · [Link 错误排查手册](https://docs.aifast.link/troubleshooting/api-errors/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_zh_guide)
