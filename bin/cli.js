#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { calculate } from '../src/calculate.js';

const HELP = `Usage:
  npx payback-check --price 500 --cost 200 --cac 3000 --churn 8 --fixed 150000

  --price   monthly revenue per customer
  --cost    monthly variable cost per customer
  --cac     cost to get one customer
  --churn   percentage of customers lost each month
  --fixed   monthly fixed costs (optional)
  --help    show this message`;

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const plain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

function readInputs() {
  const text = { type: 'string' };
  const { values } = parseArgs({
    options: {
      price: text, cost: text, cac: text, churn: text, fixed: text,
      help: { type: 'boolean' },
    },
  });
  if (values.help) return null;

  const inputs = {};
  for (const [name, value] of Object.entries(values)) {
    // Number('') is 0, so empty values have to be caught here
    if (value.trim() === '') throw new Error(`${name} is empty`);
    inputs[name] = Number(value);
  }
  return inputs;
}

function report(inputs) {
  const r = calculate(inputs);
  const months = (n) => `${plain.format(n)} months`;
  const rows = [
    ['Margin per customer per month', rupees.format(r.margin)],
    ['Average customer lifetime', months(r.lifetimeMonths)],
    ['Lifetime value (LTV)', rupees.format(r.ltv)],
    ['Payback period', r.paybackMonths === null ? 'never' : months(r.paybackMonths)],
    ['LTV : CAC', plain.format(r.ltvToCac)],
  ];
  if (inputs.fixed !== undefined) {
    const n = r.breakEvenCustomers;
    rows.push(['Break-even customers', n === null ? 'never' : plain.format(n)]);
  }

  const lines = rows.map(([label, value]) => label.padEnd(32) + value);
  if (r.warnings.length) {
    lines.push('', 'Warnings', ...r.warnings.map((w) => `- ${w}`));
  }
  return lines.join('\n');
}

try {
  const inputs = readInputs();
  console.log(inputs ? report(inputs) : HELP);
} catch (error) {
  console.error(`Error: ${error.message.split('\n')[0]}\nRun with --help to see an example.`);
  process.exitCode = 1;
}
