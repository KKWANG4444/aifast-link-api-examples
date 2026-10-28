import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
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
  assert.match(content, /0\.134\.0/);
  assert.match(blocks[1], /CODEX_FILE_CHECK_OK/);

  test(`${guide}：缺 Key 或已有目录时拒绝启动，成功路径显式选择 Link`, () => {
    for (const state of ['missing-key', 'existing-dir', 'old-version', 'prerelease', 'unknown-version', 'ready', 'next-major']) withTemp(dir => {
      if (state === 'existing-dir') mkdirSync(join(dir, 'codex-link-check'));
      // 仅用 Shell 函数记录参数，不运行真实 Codex，也不读取用户配置。
      const version = { 'old-version': 'codex-cli 0.133.0', prerelease: 'codex-cli 0.134.0-alpha.1', 'unknown-version': 'unknown', 'next-major': 'codex-cli 1.0.0' }[state] ?? 'codex-cli 0.134.0';
      const result = spawnSync('/bin/bash', ['--noprofile', '--norc', '-c', `codex() { if [ "$1" = "--version" ]; then printf '%s\\n' '${version}'; else printf 'CODEX %s\\n' "$*"; fi; }\n${blocks[0]}`], {
        cwd: dir, encoding: 'utf8', timeout: 5000,
        env: { PATH: process.env.PATH, HOME: dir, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
          ...(state === 'missing-key' ? {} : { AIFAST_LINK_API_KEY: 'TEST_ONLY_NOT_A_KEY' }) },
      });
      const valid = ['ready', 'next-major'].includes(state);
      assert.equal(result.status === 0, valid, result.stderr);
      assert.equal(result.stdout.includes('CODEX --strict-config --profile aifast_link'), valid);
      if (state === 'missing-key') assert.match(result.stderr, /Set AIFAST_LINK_API_KEY/);
    });
  });

  for (const state of ['valid', 'missing', 'no-newline', 'wrong-content', 'extra-untracked', 'extra-staged', 'tracked-change', 'ignored-extra', 'symlink', 'not-git', 'wrong-directory', 'subdirectory']) {
    test(`${guide}：完整复制执行检查 ${state}`, () => withTemp(tmp => {
      const dir = join(tmp, state === 'wrong-directory' ? 'wrong-repo' : 'codex-link-check');
      mkdirSync(dir);
      if (state !== 'not-git') assert.equal(run(dir, 'git', ['init', '-q']).status, 0);
      if (state !== 'missing') writeFileSync(join(dir, 'hello.txt'), state === 'no-newline' ? 'connection ok' : state === 'wrong-content' ? 'wrong\n' : 'connection ok\n');
      if (['extra-untracked', 'extra-staged', 'tracked-change', 'ignored-extra'].includes(state)) writeFileSync(join(dir, 'extra.txt'), 'unexpected\n');
      if (['extra-staged', 'tracked-change'].includes(state)) assert.equal(run(dir, 'git', ['add', 'extra.txt']).status, 0);
      if (state === 'tracked-change') {
        assert.equal(run(dir, 'git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'test']).status, 0);
        writeFileSync(join(dir, 'extra.txt'), 'modified\n');
      }
      if (state === 'ignored-extra') writeFileSync(join(dir, '.git/info/exclude'), 'extra.txt\n');
      if (state === 'symlink') {
        rmSync(join(dir, 'hello.txt'));
        writeFileSync(join(tmp, 'target.txt'), 'connection ok\n');
        symlinkSync(join(tmp, 'target.txt'), join(dir, 'hello.txt'));
      }
      let cwd = dir;
      if (state === 'subdirectory') {
        cwd = join(dir, 'codex-link-check');
        mkdirSync(cwd);
        writeFileSync(join(cwd, 'hello.txt'), 'connection ok\n');
      }
      const result = run(cwd, '/bin/bash', ['--noprofile', '--norc', '-c', blocks[1]]);
      assert.equal(result.status === 0, state === 'valid', `${state}: ${result.stderr}`);
      assert.equal(result.stdout.includes('CODEX_FILE_CHECK_OK'), state === 'valid');
    }));
  }
}
