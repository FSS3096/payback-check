import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/cli.js', import.meta.url));
const run = (s) => spawnSync(process.execPath, [cli, ...s.split(' ')], { encoding: 'utf8' });
const ok = '--price 500 --cost 200 --cac 3000 --churn 8';

test('report', () => {
  const r = run(`${ok} --fixed 150000`);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Lifetime value \(LTV\)\s+₹3,750/);
  assert.match(r.stdout, /Break-even customers\s+500/);
  assert.match(r.stdout, /Warnings/);
});

test('help', () => assert.match(run('--help').stdout, /npx payback-check --price 500/));

test('no margin shows never', () => {
  assert.match(run('--price 200 --cost 200 --cac 3000 --churn 8').stdout, /Payback period\s+never/);
});

test('bad input gives a short error', () => {
  for (const args of [ok.replace('3000', '3,000'), ok.replace('3000', '₹3000'),
    ok.replace('3000', 'abc'), ok.replace('3000', ''), `${ok} --prise 5`,
    ok.replace('--cost 200', '--cost -5'), '--price 500']) {
    const r = run(args);
    assert.equal(r.status, 1, args);
    assert.match(r.stderr, /^Error: .+\n/);
    assert.doesNotMatch(r.stderr, /\n\s+at /);
  }
});
