# payback-check

Give it a few numbers about a business and it works out the unit economics. If something looks weak, it tells you in plain English.

## Try it

```
npx payback-check --price 500 --cost 200 --cac 3000 --churn 8 --fixed 150000
```

```
Margin per customer per month   ₹300
Average customer lifetime       12.5 months
Lifetime value (LTV)            ₹3,750
Payback period                  10 months
LTV : CAC                       1.25
Break-even customers            500

Warnings
- LTV is only 1.25 times CAC. A common rule of thumb is at least 3.
```

## Inputs

| Flag | Meaning | Allowed |
|---|---|---|
| `--price` | monthly revenue per customer | above 0 |
| `--cost` | monthly variable cost per customer | 0 or more |
| `--cac` | cost to get one customer | above 0 |
| `--churn` | percentage of customers lost each month | above 0, up to 100 |
| `--fixed` | monthly fixed costs (optional) | 0 or more |

Type numbers without commas or the rupee sign: `150000`, not `1,50,000`.

## Use it in code

```
npm install payback-check
```

```js
import { calculate } from 'payback-check';

const result = calculate({ price: 500, cost: 200, cac: 3000, churn: 8 });
console.log(result.ltv);      // 3750
console.log(result.warnings); // array of strings
```

It returns `margin`, `lifetimeMonths`, `ltv`, `paybackMonths`, `ltvToCac`, `breakEvenCustomers` and `warnings`. It throws an error if an input is missing or not allowed. `paybackMonths` is `null` when the margin is 0 or less. `breakEvenCustomers` is also `null` if you leave out `fixed`.

## Formulas

- Margin = price - cost
- Lifetime in months = 100 / churn
- LTV = margin x lifetime
- Payback in months = cac / margin
- LTV : CAC = LTV / cac
- Break-even customers = fixed / margin, rounded up

## When it warns you

- The margin is 0 or less. This is then the only warning.
- Payback takes longer than the average customer stays.
- LTV is less than 3 times CAC.
- Payback takes more than 12 months.

The last two are rules of thumb. What counts as healthy depends on the business.

## Limits

- LTV is the simple version. It does not discount future money.
- Break-even does not include what you spend on getting customers.
- All inputs are monthly, and churn is assumed to stay the same.
- Output is in rupees only.

Needs Node 18.3 or newer.

## Licence

MIT
