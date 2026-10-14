# GPT、Claude、Gemini API Token 费用怎么算

[返回首页](../README.md) · [English](en/token-cost.md) · [下载离线算例](https://github.com/KKWANG4444/aifast-link-api-examples/releases/latest)

先从当前分组的价格页和用量记录中确认输入、输出单价及计费单位，再计算同一任务的成本。模型名字不能决定单价；不要把站内 Credit、人民币和美元直接等同。本工具不内置模型报价，不联网查询价格，也不会发起模型调用。

## 1000 次任务的可复现算例

假设输入 2.5 美元/百万 Token，输出 10 美元/百万 Token；每次输入 3000、输出 800 Token，计划 1000 次任务，额外已计费重试为 10%。**这些全部为演示参数，不是当前报价。**

```text
单次 = (3000 × 2.5 + 800 × 10) / 1000000 = 0.0155 美元
基础 = 0.0155 × 1000 = 15.50 美元
已计费重试 = 15.50 × 10% = 1.55 美元
合计 = 15.50 + 1.55 = 17.05 美元
```

在仓库根目录运行：

```bash
node scripts/cost.mjs token examples/token-cost.json
node --test
```

输出中的 `baseCost`、`billedRetryCost`、`totalCost` 分别对应基础、已计费重试和总成本。JSON 保留计算精度，显示金额时按你的账单精度格式化，不要逐请求先取整后相加。

## 输入字段及单位

修改 [token-cost.json](../examples/token-cost.json)，保持 JSON 数值类型，不给数值加引号。

| 字段 | 单位和约束 |
| --- | --- |
| `currency` | `USD` 或 `CNY`；只标记结果币种，不换汇 |
| `inputPrice` | 每百万输入 Token 的有效单价，非负数 |
| `outputPrice` | 每百万输出 Token 的有效单价，非负数 |
| `inputTokens` | 每次任务输入 Token，非负整数 |
| `outputTokens` | 每次任务输出 Token，非负整数 |
| `tasks` | 计划任务数，至少 1 的整数 |
| `billedRetryPercent` | 已计费额外重试次数 / 计划任务数 × 100，范围 0 至 1000 |

若页面按每千 Token 标价，先乘 1000 换成每百万 Token 单价。输入输出应采用同一币种、同一模型分组的有效价格；不要重复乘已包含在报价里的倍率。

## 失败重试不是全部都算钱

100 次计划任务，额外重试 8 次，仅 3 次在账单计费，应填 **3%**，不是 8%。没有日志时填 0 只是临时假设，不证明没有费用。本公式假设每次重试的输入、输出 Token 和单价与原任务相同；重试带上更多历史或切换模型时，应分开核算。

## 缓存和工具费用要分开

本工具只接受一种输入单价和一种输出单价，**不自动识别缓存命中、缓存写入、长上下文阶梯、图片或工具调用费用**。存在不同计费类别时，按不重叠的 Token 数量和对应单价分别核算后再合计；若总输入 Token 已包含缓存命中，不要再额外加一次缓存 Token。

要选择按量或月卡，还需比较实际使用天数、适用分组和逐日超额。月卡日额度不能直接转换成固定 Token 数，Gemini 独立分组也不能默认包含在 GPT/Claude 月卡中。

[在线计算](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_zh_calculator) · [按量与月卡比较](monthly-plan-vs-payg.md) · [Link 当前价格](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=token_zh_pricing)
