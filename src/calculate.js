// Allows for tiny floating point errors, e.g. 1 / (0.3 - 0.2) = 10.000000000000002
const EPSILON = 1e-9;

function check(name, value, isValid, rule) {
  if (!Number.isFinite(value) || !isValid(value)) {
    throw new Error(`${name} must be a number ${rule}`);
  }
}

export function calculate({ price, cost, cac, churn, fixed }) {
  check('price', price, (v) => v > 0, 'above 0');
  check('cost', cost, (v) => v >= 0, 'of 0 or more');
  check('cac', cac, (v) => v > 0, 'above 0');
  check('churn', churn, (v) => v > 0 && v <= 100, 'above 0 and up to 100');
  if (fixed !== undefined) check('fixed', fixed, (v) => v >= 0, 'of 0 or more');

  const margin = price - cost;
  const lifetimeMonths = 100 / churn;
  const ltv = margin * lifetimeMonths;
  const ltvToCac = ltv / cac;
  const earns = margin > 0;
  const paybackMonths = earns ? cac / margin : null;
  const breakEvenCustomers =
    earns && fixed !== undefined ? Math.max(0, Math.ceil(fixed / margin - EPSILON)) : null;

  const warnings = [];
  if (!earns) {
    warnings.push('Margin is 0 or less, so a customer never pays back what it cost to get them.');
  } else {
    if (paybackMonths > lifetimeMonths + EPSILON) {
      warnings.push('The average customer leaves before you recover what you spent to get them.');
    }
    if (ltvToCac < 3 - EPSILON) {
      // Round down so that 2.999 is never shown as 3
      const shown = Math.floor(ltvToCac * 100 + EPSILON) / 100;
      warnings.push(`LTV is only ${shown} times CAC. A common rule of thumb is at least 3.`);
    }
    if (paybackMonths > 12 + EPSILON) {
      warnings.push('Payback is over 12 months. That is slow by a common rule of thumb.');
    }
  }

  return { margin, lifetimeMonths, ltv, paybackMonths, ltvToCac, breakEvenCustomers, warnings };
}
