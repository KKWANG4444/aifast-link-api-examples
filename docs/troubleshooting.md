# Link API：401、404、429 和流式中断排查

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

[检查 Base URL](https://docs.aifast.link/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_zh_baseurl) · [Link 错误排查手册](https://docs.aifast.link/troubleshooting/api-errors/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=errors_zh_guide)
