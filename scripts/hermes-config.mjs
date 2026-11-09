import { openSync, readSync, fstatSync, closeSync, constants } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

export function checkHermesConfig(config) {
  // 仅接受独立模板，不把用户完整配置或未知字段输出到终端。
  if (!exactKeys(config, ['providers']) || !exactKeys(config.providers, ['aifast_link'])) {
    throw new Error('仅检查含 providers.aifast_link 的独立 JSON 模板，不要提供完整个人配置。');
  }
  const entry = config.providers.aifast_link;
  if (!exactKeys(entry, ['api', 'key_env', 'transport', 'default_model', 'discover_models'])
    || entry.api !== 'https://www.aifast.link/v1'
    || entry.key_env !== 'AIFAST_LINK_API_KEY'
    || entry.transport !== 'chat_completions'
    || entry.discover_models !== false
    || typeof entry.default_model !== 'string'
    || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$/.test(entry.default_model)
    || /^(?:sk-|gh[pousr]_)/.test(entry.default_model)) {
    throw new Error('模板字段不匹配：核对 Link 地址、key_env、Chat Completions 和模型 ID；禁止内嵌密钥或命令。');
  }
  return {
    scope: 'offline-template-only',
    provider: 'custom:aifast_link',
    baseUrl: entry.api,
    keyEnvironmentName: entry.key_env,
    transport: entry.transport,
    expectedRequestUrl: 'https://www.aifast.link/v1/chat/completions',
    modelIsPlaceholder: entry.default_model === 'YOUR_MODEL_ID',
    liveCallVerified: false,
  };
}

export function readHermesTemplate(file) {
  let fd;
  try {
    fd = openSync(file, constants.O_RDONLY | constants.O_NONBLOCK);
    if (!fstatSync(fd).isFile()) throw new Error();
    const bytes = Buffer.alloc(65537);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > 65536) throw new Error();
    return JSON.parse(bytes.subarray(0, length).toString('utf8'));
  } catch {
    throw new Error('需要不超过 64 KiB 的普通 JSON 模板文件；不要输入密钥、个人配置或请求日志。');
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1) throw new Error('用法：node scripts/hermes-config.mjs [template.json]');
    const file = args[0] ?? fileURLToPath(new URL('../examples/hermes/config.template.json', import.meta.url));
    console.log(JSON.stringify(checkHermesConfig(readHermesTemplate(file)), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
