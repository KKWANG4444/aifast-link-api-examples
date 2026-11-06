import assert from 'node:assert/strict';
import test from 'node:test';
import { captureRequest } from './capture-request.mjs';

test('官方 SDK 离线构建两类请求，不触发全局网络或泄漏认证头', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('离线测试不应调用真实网络'); };
  try {
    for (const protocol of ['chat', 'responses']) {
      const result = await captureRequest(protocol);
      assert.equal(result.fixtureOnly, true);
      assert.equal(result.sdkVersion, '7.53.0');
      assert.equal(result.requests.length, 1);
      assert.deepEqual(result.requests[0], {
        url: `https://www.aifast.link/v1/${protocol === 'chat' ? 'chat/completions' : 'responses'}`,
        method: 'POST',
        body: protocol === 'chat'
          ? { model: 'YOUR_MODEL_ID', messages: [{ role: 'user', content: 'Reply with OK only.' }], stream: false }
          : { model: 'YOUR_MODEL_ID', input: 'Reply with OK only.', stream: false },
      });
      assert.doesNotMatch(JSON.stringify(result), /OFFLINE_FIXTURE_NOT_A_KEY|Authorization|Bearer/i);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('错误 Base URL 会重复端点，不被误称为可用配置', async () => {
  const result = await captureRequest('chat', 'https://www.aifast.link/v1/chat/completions');
  assert.equal(result.requests[0].url, 'https://www.aifast.link/v1/chat/completions/chat/completions');
});

test('未知协议在 SDK 请求之前失败', async () => {
  await assert.rejects(captureRequest('messages'), /协议必须为/);
});
