/**
 * Irish tax parameters — TAX YEAR 2026.
 * Update annually after the Budget (usually October) and bump TAX_YEAR.
 *
 * Sources:
 * - s216D TCA 1997 / Revenue TDM Part 07-01-44 (micro-generation exemption)
 * - Revenue.ie tax rates, bands and reliefs (2026)
 */

export const TAX_YEAR = 2026;

// s216D micro-generation exemption: €400/yr PER QUALIFYING INDIVIDUAL
// named on the electricity bill (not per household). Runs 2024–2028.
export const EXEMPTION_PP = 400;

export const USC_BANDS = [
  { upTo: 12012, rate: 0.005 },
  { upTo: 28700, rate: 0.02 },
  { upTo: 70044, rate: 0.03 },
  { upTo: Infinity, rate: 0.08 },
];
export const USC_EXEMPT_LIMIT = 13000;

// Class A employee PRSI, Jan–Sep 2026 (4.35% from 1 Oct 2026 — not modelled)
export const PRSI_RATE = 0.042;

export const STATUS_OPTIONS = [
  { value: "single", label: "Single / cohabiting (taxed individually)" },
  { value: "marriedOne", label: "Married — one income" },
  { value: "marriedTwo", label: "Married — two incomes" },
];

// Standard rate cut-off per person, by household status: [personA, personB].
// Married two-income band sharing is approximated at €44,000 each
// (exact where both spouses earn above the band).
export const CUTOFFS = {
  single: [44000, 44000],
  marriedOne: [53000, 44000],
  marriedTwo: [44000, 44000],
};

export function incomeTaxGross(income, cutoff) {
  return Math.min(income, cutoff) * 0.2 + Math.max(0, income - cutoff) * 0.4;
}

export function uscTotal(income, reduced) {
  if (income <= USC_EXEMPT_LIMIT) return 0;
  if (reduced && income <= 60000) {
    // 70+ / full medical card concession: 0.5% to €12,012, 2% on balance
    return Math.min(income, 12012) * 0.005 + Math.max(0, income - 12012) * 0.02;
  }
  let tax = 0;
  let prev = 0;
  for (const b of USC_BANDS) {
    const slice = Math.min(income, b.upTo) - prev;
    if (slice <= 0) break;
    tax += slice * b.rate;
    prev = b.upTo;
  }
  return tax;
}

/**
 * Tax on one person's share of export income above their €400 exemption.
 * Uses the delta method — tax(salary + excess) − tax(salary) — so band
 * boundaries are handled exactly.
 */
export function personTax(share, salary, cutoff, reducedUsc, selfEmployed) {
  const excess = Math.max(0, share - EXEMPTION_PP);
  const sal = Math.max(0, Number(salary) || 0);
  const it = incomeTaxGross(sal + excess, cutoff) - incomeTaxGross(sal, cutoff);
  let usc = uscTotal(sal + excess, reducedUsc) - uscTotal(sal, reducedUsc);
  if (selfEmployed) {
    // 3% USC surcharge on self-employed income over €100k
    const over = (x) => Math.max(0, x - 100000);
    usc += (over(sal + excess) - over(sal)) * 0.03;
  }
  const prsi = excess * PRSI_RATE;
  return {
    excess,
    it,
    usc,
    prsi,
    total: it + usc + prsi,
    exempt: Math.min(share, EXEMPTION_PP),
  };
}
