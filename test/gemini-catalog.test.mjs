import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Gemini 新型号保留公开来源，不冒充调用或官方发布验证', async () => {
  const raw = await readFile(new URL('../examples/gemini/catalog-observation.json', import.meta.url), 'utf8');
  const record = JSON.parse(raw);
  assert.equal(record.source, 'https://www.aifast.link/api/pricing');
  assert.equal(record.captureMethod, 'unauthenticated-public-http-get');
  assert.ok(Number.isFinite(Date.parse(record.capturedAt)));
  assert.equal(record.verifiedDate, '2026-11-12');
  assert.match(record.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(record.liveCallVerified, false);
  assert.deepEqual(record.model, {
    id: 'gemini-4-carbon', endpoints: ['gemini', 'openai'], groups: ['Gemini'], billingMode: 'tiered_expr',
  });
  assert.doesNotMatch(raw, /api_key|authorization|bearer|aifast\.(hk|club)/i);
});

for (const prefix of ['', 'en/']) {
  test(`${prefix || 'zh/'}Gemini 新型号关联同语言教程并保留通用示例`, async () => {
    const text = await readFile(new URL(`../docs/${prefix}gemini-api.md`, import.meta.url), 'utf8');
    assert.ok(text.includes('gemini-4-carbon'));
    assert.ok(text.includes('examples/gemini/catalog-observation.json'));
    assert.match(text, prefix ? /not a model-call, identity or billing test/ : /不是模型调用、身份或计费测试/);
    const target = text.match(/\]\((https:\/\/docs\.aifast\.link[^)]+#carbon)\)/)?.[1];
    assert.equal(new URL(target).pathname, `/${prefix}providers/gemini-api/`);
    assert.ok(text.includes('https://www.aifast.link/pricing/gemini-4-carbon?'));
    assert.doesNotMatch(text, /aifast\.(hk|club)/);
    const request = JSON.parse(await readFile(new URL('../examples/gemini/chat-request.json', import.meta.url), 'utf8'));
    assert.equal(request.model, 'gemini-2.5-flash');
  });
}
