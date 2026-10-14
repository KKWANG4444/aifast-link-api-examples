# AIFast Link：GPT / Claude / Gemini API 接入与成本算例

[English](README.en.md) · [在线成本计算器](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_calculator) · [Link 开始使用](https://docs.aifast.link/start/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_start)

[下载最新离线算例](https://github.com/KKWANG4444/aifast-link-api-examples/releases/latest) · [Token 成本公式与输入字段](docs/token-cost.md)

这是 **AIFast Link 的独立公开示例仓库**，仅对应 `www.aifast.link` 和 `docs.aifast.link`，不是模型厂商官方项目。

Link 提供 GPT、Claude、Gemini API 接入，以及按量使用和指定分组的 GPT / Claude 月卡。这里帮助你先核对接口、权限和完整任务成本，再选择方案。**Gemini 使用独立分组，不能默认包含在 GPT / Claude 月卡中。**

## 先解决一个具体问题

| 任务 | 本仓库内容 | Link 实际工具或教程 |
| --- | --- | --- |
| 计算 Token 与已计费重试成本 | [成本公式与可运行算例](docs/token-cost.md) | [浏览器计算器](https://docs.aifast.link/tools/api-cost-calculator/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_token) |
| 比较按量与月卡，避免闲置或超额 | [月卡成本比较](docs/monthly-plan-vs-payg.md) | [计费与套餐范围](https://docs.aifast.link/payment/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_payment) |
| 区分 Chat、Responses、Messages | [Base URL 与协议配置](docs/api-setup.md) | [Link 接口能力矩阵](https://docs.aifast.link/reference/api-compatibility/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_protocols) |
| 排查 401、404、429、流式中断 | [按现象排错](docs/troubleshooting.md) | [Base URL 检查器](https://docs.aifast.link/tools/base-url-checker/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_baseurl) |

## 30 秒运行离线成本算例

需要 Node.js 22 或更新版本。没有第三方依赖，不需要安装包、注册或 API Key；下面的程序不联网、不上传输入，也不发起付费模型请求。

没有 Git 时，可从上方下载入口取得 ZIP，解压后在目录内执行相同的 `node` 命令。

```bash
git clone https://github.com/KKWANG4444/aifast-link-api-examples.git
cd aifast-link-api-examples
node scripts/cost.mjs token examples/token-cost.json
node scripts/cost.mjs plan examples/monthly-plan.json
node scripts/cost.mjs plan examples/monthly-plan-overage.json
node --test
```

内置 JSON **全部为演示参数，不是当前报价**：

- Token：2.5 / 10 美元每百万输入 / 输出 Token，每次 3000 / 800 Token，1000 次任务，10% 已计费额外重试，结果 **17.05 美元**。
- 月卡：月费 200 元、日额度 20 Credit、20 个使用日、每日使用 10 Credit、按量每天 12 元，结果 **按量 240 元、月卡 200 元**。
- 超额：改为每日 25 Credit，且已确认钱包回退和 0.7 元/Credit 的超额费用，结果 **月卡加超额 270 元**，高于按量 240 元。

修改示例 JSON 为你自己的账单参数再运行。输入费用和输出费用使用同一币种；程序不换算汇率。月卡比较使用人民币实付金额，Credit 是站内额度，不是美元或固定 Token 数量。

Token 算例仅有一种输入单价和一种输出单价，不会自动区分缓存命中、缓存写入、长上下文阶梯或工具费用。存在这些计费项时应按账单分类核算，不能把结果当完整账单。

## 接入前先区分协议

| 使用场景 | Link 配置入口 | 需要单独验证 |
| --- | --- | --- |
| OpenAI 兼容客户端 | `https://www.aifast.link/v1` | 模型权限、Chat Completions、SSE |
| Codex 自定义 Provider | `https://www.aifast.link/v1` | Responses、工具调用与长任务 |
| Claude Code | `https://www.aifast.link` | Anthropic Messages、认证变量与模型映射 |
| Gemini OpenAI 兼容方式 | `https://www.aifast.link/v1` | Gemini 分组权限与所选模型能力 |

[Codex 接入教程](https://docs.aifast.link/tools/codex/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_codex) · [Claude Code 教程](https://docs.aifast.link/tools/claude-code/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_claude) · [Gemini 协议说明](https://docs.aifast.link/providers/gemini-api/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_gemini)

目录上架不等于账号有权限，也不证明流式和工具调用已经通过。接口示例不是成功率或底层模型身份认证；本仓库 CI 只验证离线成本逻辑、样例和内容边界。

## 购买前核对

查看 [Link 实时模型价格](https://www.aifast.link/pricing?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_pricing)，核对模型 ID、分组、输入输出与缓存价格，再按自己的使用天数比较。月卡不一定更便宜，不是无限调用，也不是 ChatGPT / Claude 消费者会员。

只统计**已计费**重试。例如 100 次计划任务、8 次额外重试但仅 3 次计费，填写 3%，不是 8%；本算例假设每次重试的 Token 和单价与原任务相同。不同用量应分开计算。没有日志时填 0 只能作为临时假设。

## 核验范围与反馈

2026-10-14 核对 Link 公开文档与公开模型目录；不固定宣传模型数量、折扣或长期套餐价格。没有执行带 Key 的付费调用或真实扣款测试。计算函数有回归测试，但计算结果不替代账单。

工具问题可提交 [Issue](https://github.com/KKWANG4444/aifast-link-api-examples/issues)，附不含个人数据的最小输入与预期结果。**不要公开 API Key、Cookie、付款记录或原始请求日志**。账户和订单问题请联系 [Link 客服](https://www.aifast.link/customersupport?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=readme_zh_support)。
