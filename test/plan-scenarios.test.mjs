import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { comparePlanCost } from '../src/plan-cost.mjs';

const script = fileURLToPath(new URL('../scripts/plan-scenarios.mjs', import.meta.url));
const run = (args = [], options = {}) => spawnSync(process.execPath, [script, ...args], {
  cwd: tmpdir(), encoding: 'utf8', timeout: 10000, ...options,
});
const report = () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  return JSON.parse(result.stdout);
};

test('多场景命令从任意工作目录运行，12 行输入及结果均可复算', () => {
  const output = report();
  assert.equal(output.illustrative, true);
  assert.equal(output.currency, 'CNY');
  assert.deepEqual(output.assumptions, {
    planPeriodDays: 30, equalWorkloadPerActiveDay: true, dailyAllowanceCarryover: false,
    paygMatchesWorkloadWithinEachRow: true, refundsIncluded: false, creditsAreCurrency: false,
  });
  assert.equal(output.rows.length, 12);
  for (const row of output.rows) assert.deepEqual(row.result, comparePlanCost(row.input));
  for (const scenario of ['within-allowance', 'overage-with-fallback', 'overage-without-fallback']) {
    const rows = output.rows.filter(row => row.scenario === scenario);
    assert.deepEqual(rows.map(row => row.input.usageDays), [0, 5, 20, 30]);
    assert.deepEqual(rows.map(row => row.result.paygTotal), [0, 60, 240, 360]);
  }
});

test('完整月费及超额总价正确，零使用仍不退还月费', () => {
  const { rows } = report();
  assert.deepEqual(rows.filter(row => row.scenario === 'within-allowance').map(row => row.result.planTotal), [200, 200, 200, 200]);
  const fallback = rows.filter(row => row.scenario === 'overage-with-fallback');
  assert.deepEqual(fallback.map(row => row.result.planTotal), [200, 217.5, 270, 305]);
  assert.deepEqual(fallback.map(row => row.result.overageCredits), [0, 25, 100, 150]);
});

test('禁止钱包回退时不把月费冒充完成全部工作的成本', () => {
  const rows = report().rows.filter(row => row.scenario === 'overage-without-fallback');
  assert.equal(rows[0].result.covered, true);
  assert.equal(rows[0].result.planTotal, 200);
  for (const row of rows.slice(1)) {
    assert.equal(row.input.walletFallback, false);
    assert.equal(row.result.covered, false);
    assert.equal(row.result.planTotal, null);
    assert.equal(row.result.overageCost, null);
  }
});

test('算例仅依赖本地文件和计算函数，不读取环境中的 Key', () => {
  const source = readFileSync(script, 'utf8');
  assert.deepEqual([...source.matchAll(/from '([^']+)'/g)].map(match => match[1]), ['node:fs/promises', '../src/plan-cost.mjs']);
  assert.doesNotMatch(source, /\bfetch\s*\(|\bimport\s*\(|process\.env|https?:\/\//);
  const result = run([], { env: { ...process.env, AIFAST_LINK_API_KEY: 'fixture-not-a-real-key', OPENAI_API_KEY: 'fixture-not-a-real-key' } });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout + result.stderr, /fixture-not-a-real-key/);
  assert.deepEqual(JSON.parse(result.stdout), report());
});

test('多余参数不能被默默忽略，双语文档和入口包含运行命令', () => {
  const result = run(['extra']);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /用法/);
  for (const file of ['README.md', 'README.en.md', 'docs/monthly-plan-vs-payg.md', 'docs/en/monthly-plan-vs-payg.md']) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(text.includes('node scripts/plan-scenarios.mjs'), file);
  }
  for (const file of ['docs/monthly-plan-vs-payg.md', 'docs/en/monthly-plan-vs-payg.md']) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    for (const term of ['217.50', '270', '305', 'planTotal: null', 'illustrative: true']) assert.ok(text.includes(term), `${file}: ${term}`);
  }
});
