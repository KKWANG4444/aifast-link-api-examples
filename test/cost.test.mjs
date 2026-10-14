import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { estimateTokenCost } from '../src/token-cost.mjs';
import { comparePlanCost } from '../src/plan-cost.mjs';

const fixture = name => JSON.parse(readFileSync(new URL(`../examples/${name}.json`, import.meta.url)));
const token = fixture('token-cost');
const plan = fixture('monthly-plan');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('Token 演示与已计费重试计算', () => {
  near(estimateTokenCost(token).totalCost, 17.05);
  near(estimateTokenCost({ ...token, tasks: 100, billedRetryPercent: 3 }).totalCost, 1.5965);
  near(estimateTokenCost({ ...token, billedRetryPercent: 0 }).totalCost, 15.5);
  assert.equal(estimateTokenCost({ ...token, billedRetryPercent: 0 }).billedRetryCost, 0);
  assert.equal(estimateTokenCost({ ...token, currency: 'CNY' }).currency, 'CNY');
});

test('Token 输入拒绝缺失值、负数、字符串和超出安全范围', () => {
  for (const key of ['inputPrice', 'outputPrice', 'inputTokens', 'outputTokens', 'tasks', 'billedRetryPercent']) {
    for (const value of [null, undefined, '', '2', NaN, Infinity, -1]) assert.throws(() => estimateTokenCost({ ...token, [key]: value }));
  }
  for (const key of ['inputTokens', 'outputTokens', 'tasks']) assert.throws(() => estimateTokenCost({ ...token, [key]: 0.5 }));
  for (const change of [{ tasks: 0 }, { currency: 'EUR' }, { billedRetryPercent: 1001 }, { tasks: Number.MAX_SAFE_INTEGER }, { inputPrice: 1e308 }]) assert.throws(() => estimateTokenCost({ ...token, ...change }));
});

test('月卡使用天数与完整月费', () => {
  for (const days of [0, 5, 20, 30]) {
    const result = comparePlanCost({ ...plan, usageDays: days });
    assert.equal(result.paygTotal, days * 12);
    assert.equal(result.planTotal, 200);
    assert.equal(result.overageCredits, 0);
  }
});

test('月卡超额、钱包回退和缺失费用', () => {
  assert.deepEqual(comparePlanCost({ ...plan, dailyUsage: 25 }), {
    covered: false, paygTotal: 240, planPrice: 200, overageCredits: 100, overageCost: null, planTotal: null,
  });
  assert.equal(comparePlanCost(fixture('monthly-plan-overage')).planTotal, 270);
  assert.equal(comparePlanCost({ ...fixture('monthly-plan-overage'), overageRate: 0 }).planTotal, 200);
  assert.equal(comparePlanCost({ ...plan, dailyUsage: 25, usageDays: 0 }).covered, true);
  assert.equal(comparePlanCost({ ...plan, dailyUsage: 20 }).overageCredits, 0);
  for (const overageRate of [undefined, '', null, NaN, Infinity, -1, 1e10]) assert.throws(() => comparePlanCost({ ...plan, dailyUsage: 25, walletFallback: true, overageRate }), /invalid-overage-rate/);
});

test('月卡输入边界与溢出保护', () => {
  for (const key of ['planPrice', 'dailyAllowance', 'dailyUsage', 'usageDays', 'dailyPayg']) {
    for (const value of [null, undefined, '', '2', NaN, Infinity, -1, 1e10]) assert.throws(() => comparePlanCost({ ...plan, [key]: value }));
  }
  for (const usageDays of [0.5, 31]) assert.throws(() => comparePlanCost({ ...plan, usageDays }), /invalid-days/);
  assert.throws(() => comparePlanCost({ ...plan, walletFallback: 'false' }), /invalid-input/);
  assert.throws(() => comparePlanCost({ ...plan, dailyUsage: 1e9, walletFallback: true, overageRate: 1e9 }), /unsafe-result/);
});

test('README 的三个 CLI 命令可运行，错误命令非零退出', () => {
  const cwd = new URL('../', import.meta.url);
  for (const [mode, file, total] of [['token', 'token-cost', 17.05], ['plan', 'monthly-plan', 200], ['plan', 'monthly-plan-overage', 270]]) {
    const run = spawnSync(process.execPath, ['scripts/cost.mjs', mode, `examples/${file}.json`], { cwd, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const { result } = JSON.parse(run.stdout);
    near(mode === 'token' ? result.totalCost : result.planTotal, total);
  }
  for (const args of [[], ['other', 'examples/token-cost.json'], ['token', 'missing.json'], ['token', 'examples/token-cost.json', 'extra']]) {
    const run = spawnSync(process.execPath, ['scripts/cost.mjs', ...args], { cwd, encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.equal(run.stdout, '');
  }
});
