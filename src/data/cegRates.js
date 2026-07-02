/**
 * Clean Export Guarantee (feed-in tariff) rates, c/kWh incl. VAT.
 *
 * ⚠️ THIS IS THE FILE THAT GOES STALE. Suppliers reprice several
 * times a year. Update `rate` values and `LAST_VERIFIED`, commit,
 * and the deploy workflow ships the change automatically.
 */

export const LAST_VERIFIED = "June 2026";

export const SUPPLIERS = [
  { name: "Pinergy", rate: 25.0 },
  { name: "Electric Ireland", rate: 19.5 },
  { name: "SSE Airtricity (standard)", rate: 19.5 },
  { name: "Energia", rate: 18.5 },
  { name: "Bord Gáis Energy", rate: 18.5 },
  { name: "Flogas", rate: 18.5 },
  { name: "PrepayPower", rate: 18.0 },
  { name: "Yuno Energy", rate: 17.0 },
  { name: "Community Power", rate: 16.0 },
  { name: "Ecopower", rate: 15.2 },
  { name: "SSE Activ8 Premium (yr 1, partner install)", rate: 32.0 },
  { name: "Custom rate…", rate: null },
];
