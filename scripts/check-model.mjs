import { openSync, readSync, fstatSync, closeSync, constants } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const validId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$/.test(value);

export function checkModel(catalog, model) {
  if (!validId(model)) throw new Error('目标模型 ID 格式无效，请原样复制 id，不要输入密钥。');
  if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog) || catalog.error || catalog.success === false
    || !Array.isArray(catalog.data) || !catalog.data.every(item => item && typeof item === 'object' && !Array.isArray(item) && validId(item.id))) {
    throw new Error('需要 /v1/models 的 JSON：data 数组中的每项必须含有效 id；错误响应或价格目录不能代替模型列表。');
  }
  return {
    found: catalog.data.some(item => item.id === model),
    checkedModelCount: new Set(catalog.data.map(item => item.id)).size,
    scope: 'local-snapshot-only',
  };
}

export function readCatalog(file) {
  let fd;
  try {
    fd = openSync(file, constants.O_RDONLY | constants.O_NONBLOCK);
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error();
    const bytes = Buffer.alloc(1024 * 1024 + 1);
    // 限制实际读取量，避免文件在大小检查后增长。
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > 1024 * 1024) throw new Error();
    return JSON.parse(bytes.subarray(0, length).toString('utf8'));
  } catch {
    throw new Error('无法读取有效 JSON，请使用不超过 1 MiB 的普通模型列表文件，不要提供原始请求日志。');
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2) throw new Error('用法：node scripts/check-model.mjs <models.json> <model-id>');
    const result = checkModel(readCatalog(args[0]), args[1]);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.found ? 0 : 2;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
