import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('GPT-6.2 目录保留来源、时间和非实测边界', () => {
  const record = JSON.parse(read('examples/gpt62/catalog-observation.json'));
  assert.equal(record.source, 'https://www.aifast.link/api/pricing');
  assert.equal(record.captureMethod, 'unauthenticated-public-http-get');
  assert.equal(record.liveCallVerified, false);
  assert.ok(Number.isFinite(Date.parse(record.capturedAt)));
  assert.match(record.sourceSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(record.models.map(m => m.id).sort(), ['gpt-6.2-astra', 'gpt-6.2-sol']);
  for (const model of record.models) {
    assert.deepEqual(model.endpoints, ['openai']);
    assert.deepEqual(model.groups, ['Codex 稳定分组', 'Codex 专属分组']);
  }
});

for (const prefix of ['', 'en/']) {
  test(`GPT-6.2 ${prefix || '中文'}入口保持 Link 独立、语言和能力边界`, () => {
    const text = read(`docs/${prefix}gpt62-api.md`);
    for (const id of ['gpt-6.2-astra', 'gpt-6.2-sol']) assert.ok(text.includes(id));
    assert.doesNotMatch(text, /aifast\.(hk|club)/i);
    assert.match(text, prefix ? /not a model-call, identity or billing test/ : /不是模型调用、身份或计费测试/);
    assert.ok(text.includes(`https://docs.aifast.link/${prefix}providers/openai-api/`));
    assert.ok(text.includes(`https://docs.aifast.link/${prefix}tools/api-cost-calculator/`));
    assert.ok(read(prefix ? 'README.en.md' : 'README.md').includes(`docs/${prefix}gpt62-api.md`));
  });
}
