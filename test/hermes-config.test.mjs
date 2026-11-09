import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkHermesConfig, readHermesTemplate } from '../scripts/hermes-config.mjs';

const template = JSON.parse(readFileSync(new URL('../examples/hermes/config.template.json', import.meta.url)));
const cli = new URL('../scripts/hermes-config.mjs', import.meta.url);

test('Hermes 检查器不包含环境读取、网络或子进程入口', () => {
  const source = readFileSync(cli, 'utf8');
  assert.doesNotMatch(source, /process\.env|fetch\(|https?:\/\/[^'"\s]*\?key|child_process|node:(?:http|https|net|tls|dns)|\b(?:exec|spawn)\(/);
  assert.deepEqual([...source.matchAll(/from '([^']+)'/g)].map(match => match[1]), ['node:fs', 'node:url', 'node:path']);
});

test('Hermes 模板离线检查不修改输入且不声称线上验证', () => {
  const before = JSON.stringify(template);
  const result = checkHermesConfig(template);
  assert.equal(result.modelIsPlaceholder, true);
  assert.equal(result.liveCallVerified, false);
  assert.equal(result.expectedRequestUrl, 'https://www.aifast.link/v1/chat/completions');
  assert.equal(JSON.stringify(template), before);
  const copy = structuredClone(template);
  copy.providers.aifast_link.default_model = 'example-model';
  assert.equal(checkHermesConfig(copy).modelIsPlaceholder, false);
  assert.equal(checkHermesConfig(copy).liveCallVerified, false);
});

for (const [field, value] of [
  ['api', 'https://example.com/v1'], ['api', 'https://www.aifast.link/v1/v1'],
  ['api', 'https://www.aifast.link/v1?key=private-marker'],
  ['transport', 'codex_responses'], ['key_env', 'OPENAI_API_KEY'],
  ['discover_models', true], ['default_model', ''], ['default_model', 'sk-private-marker'],
  ['api_key', 'private-marker'], ['key_cmd', 'echo private-marker'], ['extra_headers', {}],
]) {
  test(`Hermes 模板拒绝异常字段 ${field}=${JSON.stringify(value)}`, () => {
    const copy = structuredClone(template);
    copy.providers.aifast_link[field] = value;
    assert.throws(() => checkHermesConfig(copy), error => !error.message.includes('private-marker'));
  });
}

test('Hermes 模板拒绝空配置、额外提供商和默认模型切换', () => {
  for (const value of [null, [], {}, { providers: {} }, { ...template, model: {} },
    { providers: { ...template.providers, other: {} } }]) assert.throws(() => checkHermesConfig(value));
});

test('Hermes CLI 不回显环境密钥、JSON 错误或文件内容', () => {
  const dir = mkdtempSync(join(tmpdir(), 'link-hermes-test-'));
  try {
    const file = join(dir, 'template.json');
    const run = args => spawnSync(process.execPath, [cli.pathname, ...args], {
      cwd: dir, encoding: 'utf8', timeout: 5000,
      env: { PATH: process.env.PATH, HOME: dir, AIFAST_LINK_API_KEY: 'private-marker' },
    });
    const result = run([]);
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stdout + result.stderr, /private-marker/);
    assert.equal(JSON.parse(result.stdout).liveCallVerified, false);
    for (const contents of ['{private-marker', ' '.repeat(65537)]) {
      writeFileSync(file, contents);
      const failure = run([file]);
      assert.equal(failure.status, 1);
      assert.doesNotMatch(failure.stdout + failure.stderr, /private-marker/);
    }
    assert.throws(() => readHermesTemplate(dir));
    assert.throws(() => readHermesTemplate(join(dir, 'missing')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
