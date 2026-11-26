import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../src/calculate.js';

const base = { price: 500, cost: 200, cac: 3000, churn: 8 };

test('worked example', () => {
  const r = calculate({ ...base, fixed: 150000 });
  assert.deepEqual(
    [r.margin, r.lifetimeMonths, r.ltv, r.paybackMonths, r.ltvToCac, r.breakEvenCustomers],
    [300, 12.5, 3750, 10, 1.25, 500]);
  assert.equal(r.warnings.length, 1);
  assert.match(r.warnings[0], /at least 3/);
});

test('no margin', () => {
  const r = calculate({ ...base, cost: 500, fixed: 1000 });
  assert.equal(r.paybackMonths, null);
  assert.equal(r.breakEvenCustomers, null);
  assert.equal(r.warnings.length, 1);
});

test('customer leaves before payback', () => {
  const w = calculate({ ...base, cac: 6000 }).warnings.join(' ');
  assert.match(w, /leaves before/);
  assert.match(w, /over 12 months/);
});

test('exact thresholds do not warn', () => {
  assert.deepEqual(calculate({ price: 100, cost: 0, cac: 1200, churn: 100 / 36 }).warnings, []);
});

test('decimal break-even', () => {
  assert.equal(calculate({ ...base, price: 0.3, cost: 0.2, fixed: 1 }).breakEvenCustomers, 10);
});

test('invalid input names the field', () => {
  for (const [key, value] of [['price', 0], ['cost', -1], ['cac', 0], ['churn', 0],
    ['churn', 101], ['fixed', -1], ['price', NaN], ['cac', undefined]]) {
    assert.throws(() => calculate({ ...base, [key]: value }), new RegExp(key));
  }
});
