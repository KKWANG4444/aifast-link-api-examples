# GPT-6.2 Astra / Sol API：Link 接入与分组核对

[返回首页](../README.md) · [English](en/gpt62-api.md)

2026-11-18，AIFast Link 公开模型目录已列出 `gpt-6.2-astra` 和 `gpt-6.2-sol`，分组为 Codex 稳定分组、Codex 专属分组，声明端点类型为 `openai`。记录见[目录快照](../examples/gpt62/catalog-observation.json)，包含来源、时间和响应摘要哈希；没有 Key 或账户数据。

这是公开目录记录，不是模型调用、身份或计费测试。目录更新不证明任意 Key 已获权限，也不保证每种套餐包含这两个模型。

## 从模型 ID 到最小请求

1. Base URL 使用 `https://www.aifast.link/v1`，不填 Docs 地址，不重复 `/v1`。
2. 使用 Link 账户创建的独立限额 Key 查询 `/v1/models`；不要向 Link 发送其他平台的 Key。
3. 从当前账户列表确认精确 ID，再在 [SDK 接入模板](api-setup.md#sdk-request-fixture)中设置模型；不要自动替换现有生产模型。
4. Chat Completions、Responses、SSE 与工具调用分别验收。目录的 `openai` 声明不能证明 Codex 的 `/v1/responses` 和文件任务已通过。

[GPT-6.2 Astra 详情](https://www.aifast.link/pricing/gpt-6.2-astra?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_zh_1) · [GPT-6.2 Sol 详情](https://www.aifast.link/pricing/gpt-6.2-sol?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_zh_2) · [Codex 独立 Provider 模板](codex-provider.md)

## 先核算任务成本，再选择按量或月卡

先核对当前模型、分组、输入/输出/缓存计费项，再用 [API 成本计算器](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_cost_zh)估算实际工作量。阶梯、缓存和额外工具费用需单独核算；旧模型的价格和套餐资格不能直接沿用。月卡不是无限调用，也不是模型厂商的消费者会员。

本仓库的算例可离线运行，不调用模型。真实请求可能计费，生产迁移前应使用限额 Key 验证并核对账单。

[完整双语接入与 FAQ](https://docs.aifast.link/providers/openai-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_guide_zh#gpt-6-2) · [公开目录来源](https://www.aifast.link/api/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=gpt62_zh_3)
