import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const protocolReferences = new Set([
  'https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create',
  'https://developers.openai.com/api/docs/guides/token-counting',
  'https://developers.openai.com/api/docs/guides/prompt-caching',
]);
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
        } else if (!protocolReferences.has(url.href)) {
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

test('中英文入口包含下载及完整 Token 字段说明', () => {
  const fields = Object.keys(JSON.parse(readFileSync(resolve(root, 'examples/token-cost.json'), 'utf8')));
  for (const [readme, guide] of [['README.md', 'docs/token-cost.md'], ['README.en.md', 'docs/en/token-cost.md']]) {
    const entry = readFileSync(resolve(root, readme), 'utf8');
    const text = readFileSync(resolve(root, guide), 'utf8');
    assert.ok(entry.includes(`](${guide})`));
    assert.ok(entry.includes('https://github.com/KKWANG4444/aifast-link-api-examples/releases/latest'));
    for (const field of fields) assert.ok(text.includes(`\`${field}\``), `${guide}: ${field}`);
    assert.match(text, /17\.05/);
    assert.match(text, /缓存|cache/);
  }
});

test('成本说明提供同语言用量深链并区分聚合与缓存计费', () => {
  for (const [file, prefix] of [['docs/token-cost.md', ''], ['docs/en/token-cost.md', 'en/']]) {
    const content = readFileSync(resolve(root, file), 'utf8');
    for (const field of ['usage.prompt_tokens', 'usage.completion_tokens', 'usage.input_tokens', 'usage.output_tokens', 'total_tokens']) assert.ok(content.includes(field), field);
    const link = [...content.matchAll(/\]\((https:\/\/docs\.aifast\.link[^)]+#usage-to-cost)\)/g)].map(match => new URL(match[1]));
    assert.equal(link.length, 1);
    assert.equal(link[0].pathname, `/${prefix}tools/api-cost-calculator/`);
    for (const reference of protocolReferences) assert.ok(content.includes(reference));
    assert.match(content, prefix ? /not completed Link calls/ : /不是 Link 已完成的调用记录/);
    assert.equal(content.split('\n').filter(line => line === (prefix ? '## Count only billed retries' : '## 失败重试不是全部都算钱')).length, 1);
  }
});

test('模型不存在排错保留权限、协议边界及同语言 Link 深链', () => {
  for (const [guide, language] of [['docs/troubleshooting.md', ''], ['docs/en/troubleshooting.md', 'en/']]) {
    const content = readFileSync(resolve(root, guide), 'utf8');
    assert.match(content, /^# .*model not found/im);
    for (const term of ['/v1/models', 'Responses', 'Messages', 'Chat Completions', 'Gemini', '401']) {
      assert.ok(content.includes(term), `${guide}: ${term}`);
    }
    assert.ok(content.includes(`https://docs.aifast.link/${language}troubleshooting/model-not-found/`));
    assert.ok(content.includes(`https://docs.aifast.link/${language}reference/api-compatibility/`));
    assert.ok(content.includes('api-setup.md'));
  }
});

test('SDK 排错区分协议、版本与路径，双语入口保留成本定位', () => {
  for (const [guide, language] of [['docs/api-setup.md', ''], ['docs/en/api-setup.md', 'en/']]) {
    const content = readFileSync(resolve(root, guide), 'utf8');
    for (const term of ['base_url', 'baseURL', '/v1/v1', 'Responses', 'SDK', 'curl', 'unsupported parameter']) {
      assert.ok(content.includes(term), `${guide}: ${term}`);
    }
    assert.ok(content.includes(`https://docs.aifast.link/${language}topics/openai-compatible/`));
    assert.ok(content.includes(`https://docs.aifast.link/${language}reference/api-compatibility/`));
    assert.ok(content.includes('](troubleshooting.md)'));
  }
  assert.match(readFileSync(resolve(root, 'README.md'), 'utf8'), /^# AIFast Link：GPT \/ Claude \/ Gemini API 接入与成本算例/);
  assert.match(readFileSync(resolve(root, 'README.en.md'), 'utf8'), /^# AIFast Link: LLM API cost calculator and integration examples/);
});
