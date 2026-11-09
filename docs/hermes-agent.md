# Hermes Agent 自定义 API：Link 模板与无密钥检查

[English](en/hermes-agent.md) · [Link 完整教程](https://docs.aifast.link/tools/hermes-agent/?utm_source=github&utm_medium=repository&utm_campaign=link_api_examples&utm_content=hermes_zh_guide)

Hermes 的命名 Provider 可以将 Link 地址、协议和密钥变量分开配置。本例只覆盖 Chat Completions：Base URL 为 `https://www.aifast.link/v1`，预期请求路径为 `/v1/chat/completions`。Responses、Messages、工具调用和账号模型权限需要另行验证。

## 不安装 Hermes 也能检查模板

需要 Node.js 22 或更新版本；不安装依赖，不联网，不读取环境变量中的密钥，不启动 Hermes，不修改个人配置。

```bash
node scripts/hermes-config.mjs
node --test test/hermes-config.test.mjs
```

[模板 JSON](../examples/hermes/config.template.json) 是 YAML 可接受的 JSON 子集，仅含 `providers.aifast_link`，不设置全局默认模型。可以在独立副本中把 `YOUR_MODEL_ID` 改成待核验的模型 ID，再执行 `node scripts/hermes-config.mjs path/to/template.json`。检查器只接受本例字段，不是通用 Hermes 配置验证器；不要传入个人完整配置或密钥。

检查成功会输出 `scope: offline-template-only`、`modelIsPlaceholder` 和 `liveCallVerified: false`。退出码 0 只说明字段符合本例约束，不证明模型存在、认证成功或付费请求可用。

## 经人工核对后配置 Hermes

将模板字段合并到实际使用的 `config.yaml`，保留其他 Provider。已有同名项时先比较，不能直接覆盖。`key_env` 仅保存变量名 `AIFAST_LINK_API_KEY`；真实 Key 通过本地密钥管理配置，不能提交到 Git。

只有明确选择 Link 时才设置以下模型项，替换真实 ID 后再使用；这一步会改变当前 profile 的模型选择：

```yaml
model:
  default: YOUR_MODEL_ID
  provider: custom:aifast_link
```

首次配置也可在终端运行 `hermes model`。聊天里的 `/model` 用来切换已配置模型，不代替首次配置。旧版 `custom_providers` 结构仍有兼容支持，升级前按安装版本核对。

`HERMES_HOME` 选择配置和状态目录，不是操作系统沙箱。工具子进程可能访问真实 HOME 和 CLI 凭据。压缩、标题、视觉等辅助任务也应核对路由，不能假定主对话选了 Link，全部辅助请求就一定走 Link。

## 验收与成本边界

2026-11-09 核对官方配置资料。此模板未执行带 Key 的调用；后续实测应记录客户端版本、模型 ID、最终域名与路径、普通输出、工具结果、流式结束、账单及失败项。成功的普通文本响应不能替代工具或计费验收。不要公开 Key、Cookie 或原始请求日志。

Agent 重试和工具循环可能增加用量。用[离线成本算例](monthly-plan-vs-payg.md)对照使用天数、日额度、超额与钱包回退；示例数字不是 Link 报价，月卡也不是无限调用。

官方依据：[提供商配置](https://hermes-agent.nousresearch.com/docs/integrations/providers) · [配置优先级与目录](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)。官方客户端支持某协议，不等于 Link 上的每个模型都支持它。
