import OpenAI from 'openai';
import { VERSION } from 'openai/version';
import { pathToFileURL } from 'node:url';

// 所有 SDK 请求都由本地替身处理，不读取环境变量中的 Key，也不调用真实 fetch。
export async function captureRequest(protocol, baseURL = 'https://www.aifast.link/v1') {
  if (!['chat', 'responses'].includes(protocol)) throw new Error('协议必须为 chat 或 responses');
  const requests = [];
  const client = new OpenAI({
    apiKey: 'OFFLINE_FIXTURE_NOT_A_KEY',
    baseURL,
    maxRetries: 0,
    timeout: 30_000,
    logLevel: 'off',
    fetch: async (input, init) => {
      requests.push({
        url: String(input),
        method: init.method,
        body: JSON.parse(init.body),
      });
      return new Response(JSON.stringify({ fixture_only: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });
  if (protocol === 'chat') {
    await client.chat.completions.create({
      model: 'YOUR_MODEL_ID',
      messages: [{ role: 'user', content: 'Reply with OK only.' }],
      stream: false,
    });
  } else {
    await client.responses.create({ model: 'YOUR_MODEL_ID', input: 'Reply with OK only.', stream: false });
  }
  return { fixtureOnly: true, sdkVersion: VERSION, protocol, requests };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await captureRequest(process.argv[2] || 'chat'), null, 2));
}
