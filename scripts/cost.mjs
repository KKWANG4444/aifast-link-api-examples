import { readFile } from 'node:fs/promises';
import { estimateTokenCost } from '../src/token-cost.mjs';
import { comparePlanCost } from '../src/plan-cost.mjs';

const [mode, file, ...extra] = process.argv.slice(2);
if (extra.length || !file || !['token', 'plan'].includes(mode)) {
  console.error('用法: node scripts/cost.mjs <token|plan> <input.json>');
  process.exitCode = 1;
} else {
  try {
    const input = JSON.parse(await readFile(file, 'utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalid-input');
    const result = mode === 'token' ? estimateTokenCost(input) : { currency: 'CNY', ...comparePlanCost(input) };
    console.log(JSON.stringify({ mode, result }, null, 2));
  } catch (error) {
    // 不回显输入文件内容，避免意外记录敏感信息。
    const codes = new Set(['invalid-input', 'invalid-currency', 'invalid-count', 'invalid-days', 'invalid-overage-rate', 'unsafe-result']);
    console.error(codes.has(error.message) ? error.message : 'invalid-json-or-file');
    process.exitCode = 1;
  }
}
