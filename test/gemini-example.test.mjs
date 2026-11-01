import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkModel, readCatalog } from '../scripts/check-model.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const demoFile = join(root, 'examples/gemini/models.demo.json');
const demo = readCatalog(demoFile);

test('精确区分大小写与模型名称，不把目录命中当成调用成功', () => {
  assert.deepEqual(checkModel(demo, 'gemini-2.5-flash'), { found: true, checkedModelCount: 1, scope: 'local-snapshot-only' });
  for (const id of ['gemini-2.5-Flash', 'gemini-2.5-flash-lite', 'missing']) assert.equal(checkModel(demo, id).found, false);
  assert.equal(checkModel({ data: [] }, 'gemini-2.5-flash').found, false);
  assert.equal(checkModel({ data: [...demo.data, ...demo.data] }, 'gemini-2.5-flash').checkedModelCount, 1);
});

test('输入无效与模型缺失分开，拒绝错误对象和价格目录', () => {
  for (const invalid of [null, [], {}, { error: { message: 'private' }, data: [] }, { success: false, data: [] }, { data: [{}] }, { data: [{ model_name: 'gemini-2.5-flash' }] }, { data: [null] }, { data: [{ id: 7 }] }, { data: [{ id: 'model name' }] }]) {
    assert.throws(() => checkModel(invalid, 'gemini-2.5-flash'), /需要/);
  }
  for (const invalid of ['', null, ' a', 'a\n', '<script>', 'a'.repeat(201)]) assert.throws(() => checkModel(demo, invalid), /格式无效/);
});

test('CLI 区分退出码，不回显输入文件中的敏感内容', () => {
  const dir = mkdtempSync(join(tmpdir(), 'link-model-test-'));
  const run = (...args) => spawnSync(process.execPath, [join(root, 'scripts/check-model.mjs'), ...args], { encoding: 'utf8', timeout: 5000, env: { PATH: process.env.PATH, AIFAST_LINK_API_KEY: 'TEST_ENV_NOT_A_KEY' } });
  try {
    for (const [id, exit] of [['gemini-2.5-flash', 0], ['gemini-2.5-Flash', 2]]) {
      const result = run(demoFile, id);
      assert.equal(result.status, exit, result.stderr);
      assert.equal(JSON.parse(result.stdout).found, exit === 0);
      assert.doesNotMatch(result.stdout + result.stderr, /TEST_ENV_NOT_A_KEY/);
    }
    for (const body of ['<html>PRIVATE_TEST</html>', '{"PRIVATE_TEST":', JSON.stringify({ error: { message: 'PRIVATE_TEST' } }), ' '.repeat(1024 * 1024 + 1)]) {
      const file = join(dir, 'input.json');
      writeFileSync(file, body);
      const result = run(file, 'gemini-2.5-flash');
      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      assert.doesNotMatch(result.stderr, /PRIVATE_TEST/);
    }
    for (const args of [[], [demoFile], [dir, 'model'], [join(dir, 'missing.json'), 'model'], [demoFile, 'model', 'extra']]) assert.equal(run(...args).status, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('检查器代码仅使用本地文件，不读取环境或调用网络及子进程', () => {
  const source = readFileSync(join(root, 'scripts/check-model.mjs'), 'utf8');
  const imports = [...source.matchAll(/from '([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(imports, ['node:fs', 'node:url', 'node:path']);
  assert.doesNotMatch(source, /process\.env|\bfetch\s*\(|\bimport\s*\(|child_process|https?:/);
});

test('双语Gemini示例缺Key不发送，单次限时且只指向Link', () => {
  const body = JSON.parse(readFileSync(join(root, 'examples/gemini/chat-request.json'), 'utf8'));
  assert.deepEqual(body, { model: 'gemini-2.5-flash', messages: [{ role: 'user', content: 'Reply with OK.' }], stream: false });
  for (const [path, language] of [['docs/gemini-api.md', ''], ['docs/en/gemini-api.md', 'en/']]) {
    const content = readFileSync(join(root, path), 'utf8');
    const code = [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map(match => match[1]).find(value => value.includes('curl'));
    const run = key => spawnSync('/bin/bash', ['--noprofile', '--norc', '-c', `curl() { printf '%s\\0' "$@"; }\n${code}`], { encoding: 'utf8', timeout: 5000, env: { PATH: '/usr/bin:/bin', ...(key ? { AIFAST_LINK_API_KEY: key } : {}) } });
    const missing = run();
    assert.notEqual(missing.status, 0);
    assert.equal(missing.stdout, '');
    const ready = run('TEST_ONLY_NOT_A_KEY');
    assert.equal(ready.status, 0, ready.stderr);
    const args = ready.stdout.split('\0').filter(Boolean);
    assert.ok(args.includes('https://www.aifast.link/v1/chat/completions'));
    assert.equal(args[args.indexOf('--max-time') + 1], '60');
    assert.equal(args[args.indexOf('--connect-timeout') + 1], '10');
    assert.equal(args[args.indexOf('--data-binary') + 1], '@examples/gemini/chat-request.json');
    assert.doesNotMatch(code, /--retry|--verbose|--insecure/);
    assert.match(content, language ? /synthetic test data/ : /人为构造的测试数据/);
    assert.match(content, language ? /may incur charges/ : /可能产生费用/);
    assert.match(content, language ? /No authenticated paid acceptance test/ : /没有执行带 Key 的付费验收/);
    assert.ok(content.includes(`https://docs.aifast.link/${language}providers/gemini-api/`));
    assert.ok(content.includes(`https://docs.aifast.link/${language}tools/api-cost-calculator/`));
  }
});
