import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Claude 公开目录记录保留来源与分组，不冒充调用实测', async () => {
  const raw = await readFile(new URL('../examples/claude-code/catalog-observation.json', import.meta.url), 'utf8');
  const record = JSON.parse(raw);
  assert.equal(record.source, 'https://www.aifast.link/api/pricing');
  assert.equal(record.captureMethod, 'unauthenticated-public-http-get');
  assert.ok(Number.isFinite(Date.parse(record.capturedAt)));
  assert.equal(record.verifiedDate, '2026-11-11');
  assert.match(record.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(record.liveCallVerified, false);
  assert.equal(record.model.id, 'claude-fable-5-2');
  assert.deepEqual(record.model.endpoints, ['anthropic', 'openai']);
  assert.deepEqual(record.model.groups, ['Claude Code 稳定分组', 'Claude Code 专属分组']);
  assert.doesNotMatch(raw, /api_key|authorization|bearer|aifast\.(hk|club)/i);
});

for (const prefix of ['', 'en/']) {
  test(`${prefix || 'zh/'}Claude 说明关联同语言教程并保留权限边界`, async () => {
    const text = await readFile(new URL(`../docs/${prefix}claude-code.md`, import.meta.url), 'utf8');
    assert.ok(text.includes('claude-fable-5-2'));
    assert.ok(text.includes('examples/claude-code/catalog-observation.json'));
    assert.match(text, prefix ? /not a model-call, identity or billing test/ : /不是模型调用、身份或计费测试/);
    const target = text.match(/\]\((https:\/\/docs\.aifast\.link[^)]+#fable-5-2)\)/)?.[1];
    assert.equal(new URL(target).pathname, `/${prefix}providers/claude-api/`);
    const headings = text.split('\n').filter(line => line.startsWith('## '));
    assert.equal(new Set(headings).size, headings.length);
  });
}
