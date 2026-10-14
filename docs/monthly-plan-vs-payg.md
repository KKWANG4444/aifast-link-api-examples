# API 按量还是月卡：使用天数与超额怎么算

[返回首页](../README.md) · [English](en/monthly-plan-vs-payg.md)

## 对比同一工作量，不对比两个不同的数字

先分别核对按量分组的人民币实付成本和月卡分组的 Credit 消耗。Credit 是站内用量单位，不是人民币、美元或固定 Token 数量。GPT / Claude 月卡有适用分组，不能默认包含 Gemini。当前有效期、日额度、续费和退款以购买条款为准。

本仓库月卡模型假设有效期为 30 天、每个使用日工作量相同、日额度不跨天抵扣。实际用量波动时应逐日核算，不能把平均值当峰值使用。退款不纳入估算。

## 演示：并非用月卡总是更便宜

假设月费 200 元、每天额度 20 Credit、每天消耗 10 Credit，同样工作量按量每天 12 元。这些是演示值，不是当前商品报价。

| 实际使用天数 | 按量实付 | 月卡实付 |
| --- | --- | --- |
| 0 | 0 元 | 200 元 |
| 5 | 60 元 | 200 元 |
| 20 | 240 元 | 200 元 |
| 30 | 360 元 | 200 元 |

```bash
node scripts/cost.mjs plan examples/monthly-plan.json
node scripts/cost.mjs plan examples/monthly-plan-overage.json
```

第二个算例每天使用 25 Credit，20 天累计超额 100 Credit。只有确认允许钱包回退且知道同分组实际超额费用后才能算总价。演示单价 0.7 元/Credit 时，完整费用为 `200 + 100 × 0.7 = 270` 元，而按量是 240 元。

若不允许钱包回退，结果是 `covered: false`、`planTotal: null`，不是“200 元完成全部任务”。缺少超额单价时程序报错，不把空值当免费。

## 输入字段

| JSON 字段 | 含义 |
| --- | --- |
| `planPrice` | 本次 30 天方案的完整实付月费，人民币 |
| `dailyAllowance` | 每日可用 Credit |
| `dailyUsage` | 同样工作量在月卡分组每天消耗的 Credit |
| `usageDays` | 0 至 30 的整数 |
| `dailyPayg` | 同样工作量每天按量实付人民币，包含已计费重试 |
| `walletFallback` | 是否已确认该套餐和账户允许超额扣钱包，布尔值 |
| `overageRate` | 超额同分组的实际人民币/Credit，超额且允许回退时必填 |

按量和月卡都应包含实际计费的重试。没有计费的失败请求不纳入。Token 示例字段 `billedRetryPercent` 是已计费额外重试数除以计划任务数的百分比，并假设重试 Token 和单价与单次任务一致。

[按自己的输入在线比较](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=plan_zh_calculator) · [查看 Link 计费与套餐范围](https://docs.aifast.link/payment/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=plan_zh_payment)
