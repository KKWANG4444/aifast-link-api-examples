import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const guides = ['docs/codex-provider.md', 'docs/en/codex-provider.md'];
const withTemp = fn => {
  const dir = mkdtempSync(join(tmpdir(), 'link-codex-test-'));
  try { fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
};
const run = (cwd, cmd, args) => spawnSync(cmd, args, {
  cwd, encoding: 'utf8', timeout: 5000,
  env: { PATH: process.env.PATH, HOME: cwd, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' },
});

test('模板精确使用 Link 命名空间，Provider 不改变默认选择', () => {
  assert.equal(read('examples/codex/provider.toml'), '[model_providers.aifast_link]\nname = "AIFast Link"\nbase_url = "https://www.aifast.link/v1"\nenv_key = "AIFAST_LINK_API_KEY"\nwire_api = "responses"\n');
  assert.equal(read('examples/codex/aifast_link.config.toml'), 'model = "YOUR_MODEL_ID"\nmodel_provider = "aifast_link"\n');
  assert.match(read('examples/codex/task.txt'), /exactly connection ok followed by a newline/);
  assert.match(read('examples/codex/task.txt'), /Do not stage, commit, or modify any other files/);
});

for (const guide of guides) {
  const content = read(guide);
  const blocks = [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map(match => match[1]);
  const checkLine = blocks[1].split('\n').find(line => line.startsWith('node -e '));
  assert.ok(checkLine?.startsWith("node -e '"));
  const assertion = checkLine.slice("node -e '".length, -1);

  test(`${guide}：缺 Key 或已有目录时拒绝启动，成功路径显式选择 Link`, () => {
    for (const state of ['missing-key', 'existing-dir', 'ready']) withTemp(dir => {
      if (state === 'existing-dir') mkdirSync(join(dir, 'codex-link-check'));
      // 仅用 Shell 函数记录参数，不运行真实 Codex，也不读取用户配置。
      const result = spawnSync('/bin/bash', ['--noprofile', '--norc', '-c', `codex() { printf 'CODEX %s\\n' "$*"; }\n${blocks[0]}`], {
        cwd: dir, encoding: 'utf8', timeout: 5000,
        env: { PATH: process.env.PATH, HOME: dir, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
          ...(state === 'missing-key' ? {} : { AIFAST_LINK_API_KEY: 'TEST_ONLY_NOT_A_KEY' }) },
      });
      assert.equal(result.status === 0, state === 'ready', result.stderr);
      assert.equal(result.stdout.includes('CODEX --strict-config --profile aifast_link'), state === 'ready');
      if (state === 'missing-key') assert.match(result.stderr, /Set AIFAST_LINK_API_KEY/);
    });
  });

  test(`${guide}：人工文件验证缺失、错误内容与换行，普通 diff 会漏掉未跟踪文件`, () => withTemp(dir => {
    assert.equal(run(dir, 'git', ['init', '-q']).status, 0);
    assert.notEqual(run(dir, process.execPath, ['-e', assertion]).status, 0);
    for (const text of ['connection ok', 'wrong\n', 'connection ok\nextra\n']) {
      writeFileSync(join(dir, 'hello.txt'), text);
      assert.notEqual(run(dir, process.execPath, ['-e', assertion]).status, 0);
    }
    writeFileSync(join(dir, 'hello.txt'), 'connection ok\n');
    const valid = run(dir, process.execPath, ['-e', assertion]);
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(valid.stdout, 'FILE_CONTENT_OK\n');
    assert.equal(run(dir, 'git', ['status', '--short', '--untracked-files=all']).stdout, '?? hello.txt\n');
    assert.equal(run(dir, 'git', ['diff', '--exit-code']).status, 0);
    assert.equal(run(dir, 'git', ['diff', '--cached', '--exit-code']).status, 0);
    writeFileSync(join(dir, 'extra.txt'), 'unexpected\n');
    assert.notEqual(run(dir, 'git', ['status', '--short', '--untracked-files=all']).stdout, '?? hello.txt\n');
    assert.equal(run(dir, 'git', ['add', 'hello.txt']).status, 0);
    assert.equal(run(dir, 'git', ['diff', '--cached', '--exit-code']).status, 1);
    writeFileSync(join(dir, 'hello.txt'), 'changed after staging\n');
    assert.equal(run(dir, 'git', ['diff', '--exit-code']).status, 1);
  }));
}
