# 更新记录

## 0.1.5 · 2026-11-06

- 下载包补齐官方 Node SDK 请求捕获示例，对照 Chat Completions 与 Responses；SDK 需单独安装，测试使用离线替身，不代表线上模型调用成功。
- 增加 `node scripts/plan-scenarios.mjs`，复用原有月卡计算逻辑，输出 0／5／20／30 天、额度内／钱包回退／不允许回退共 12 组可复算结果。
- 中英文入口和成本文档补齐命令、结果表、同工作量比较及 `null` 含义。价格均为演示，不宣传固定优惠。
- 保留现有协议、凭据安全和套餐边界。未变更许可证，未执行带 Key 的调用。

### English summary

- Includes the offline official Node SDK request fixture for Chat Completions and Responses. Install SDK dependencies separately; fixture success does not establish live compatibility.
- Adds 12 reproducible plan-cost scenarios for 0 / 5 / 20 / 30 active days, with and without wallet fallback.
- Updates both language guides with commands, outputs and same-workload assumptions. All prices are illustrative; license terms are unchanged.
