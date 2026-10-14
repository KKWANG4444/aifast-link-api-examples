import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  if (['.git', 'node_modules'].includes(entry.name)) return [];
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? files(path) : [path];
});

test('公开文档只链接 Link，归因参数独立且本地链接存在', () => {
  for (const file of files(root).filter(path => path.endsWith('.md'))) {
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /aifast\.(hk|club)\b/i, file);
    for (const match of content.matchAll(/\]\(([^\s)]+)\)/g)) {
      const link = match[1];
      if (link.startsWith('https://')) {
        const url = new URL(link);
        if (url.hostname.endsWith('aifast.link')) {
          assert.ok(['www.aifast.link', 'docs.aifast.link'].includes(url.hostname));
          assert.equal(url.searchParams.get('utm_source'), 'github');
          assert.equal(url.searchParams.get('utm_medium'), 'repository');
          assert.equal(url.searchParams.get('utm_campaign'), 'link_api_examples');
          assert.ok(url.searchParams.get('utm_content'));
        } else {
          assert.equal(url.hostname, 'github.com');
          assert.match(url.pathname, /^\/KKWANG4444\/aifast-link-api-examples(?:\/|$)/);
        }
      } else assert.ok(existsSync(resolve(dirname(file), link.split('#')[0])), `${file}: ${link}`);
    }
  }
});

test('公开文件不包含凭据或私有运行文件', () => {
  for (const file of files(root)) {
    assert.doesNotMatch(file.slice(root.length), /(?:^|\/)(?:\.env(?:\.|$)|reports\/|private\/)/);
    assert.doesNotMatch(readFileSync(file, 'utf8'), /(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|^-----BEGIN [A-Z ]*PRIVATE KEY-----$)/m, file);
  }
});

test('两种语言保留套餐边界、演示参数及验证范围', () => {
  const zh = readFileSync(resolve(root, 'README.md'), 'utf8');
  const en = readFileSync(resolve(root, 'README.en.md'), 'utf8');
  assert.match(zh, /Gemini 使用独立分组/);
  assert.match(zh, /全部为演示参数，不是当前报价/);
  assert.match(zh, /没有执行带 Key 的付费调用/);
  assert.match(en, /Do not assume those plans include the separate Gemini group/);
  assert.match(en, /illustrative inputs, not current offers/);
  assert.match(en, /has not performed authenticated paid calls/);
});
