# irishsolartax.com

Irish solar export income & tax calculator. Estimates Clean Export Guarantee (CEG)
income and the income tax, USC and PRSI due above the s216D micro-generation
exemption — which applies **per person named on the electricity bill** (€400 each,
2024–2028), not per household.

Built with React + Vite. Deployed to GitHub Pages via GitHub Actions on every push
to `main`.

## Local development

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## First-time deployment setup

1. **Create the GitHub repo and push:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:<your-username>/irishsolartax.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:** in the repo go to **Settings → Pages** and set
   **Source** to **GitHub Actions**. The workflow in
   `.github/workflows/deploy.yml` will build and deploy on every push to `main`
   (you can also trigger it manually from the Actions tab).

3. **Point the domain at GitHub Pages.** At your domain registrar, add these DNS
   records for `irishsolartax.com`:

   | Type  | Host | Value             |
   |-------|------|-------------------|
   | A     | @    | 185.199.108.153   |
   | A     | @    | 185.199.109.153   |
   | A     | @    | 185.199.110.153   |
   | A     | @    | 185.199.111.153   |
   | CNAME | www  | `<your-username>.github.io` |

4. **Register the custom domain with GitHub:** in **Settings → Pages → Custom
   domain**, enter `irishsolartax.com` and save. Wait for the DNS check to pass,
   then tick **Enforce HTTPS** (the certificate can take up to an hour to issue).

   The `public/CNAME` file in this repo keeps the custom domain setting from
   being wiped on each deploy — don't delete it.

5. Done. Every push to `main` now goes live at https://irishsolartax.com within
   a minute or two.

## Maintenance

The data that goes stale lives in two files, deliberately separated from the UI:

- **`src/data/cegRates.js`** — supplier export rates. Suppliers reprice several
  times a year. Update the `rate` values and `LAST_VERIFIED`, commit, push.
  The "verified" date shown in the UI updates automatically.
- **`src/data/tax2026.js`** — tax bands, USC, PRSI, and the s216D exemption.
  Update once a year after the Budget (October) and bump `TAX_YEAR`. The
  exemption is currently legislated to the end of 2028 — watch Budget 2029.

## Tax model notes

- Exemption is €400 **per qualifying individual named on the electricity bill**
  (Revenue TDM Part 07-01-44). This tool splits export income equally between
  named persons; each person's excess is taxed at their own marginal rates
  using the delta method (tax on salary+excess minus tax on salary), so band
  boundaries are handled exactly.
- Simplifications: PRSI applied flat at 4.2% on the excess (in practice
  unearned income ≤ €5,000/yr may attract no PRSI for PAYE workers); the
  October 2026 PRSI step to 4.35% is not blended; married two-income band
  sharing is approximated at €44,000 per spouse; deductible revenue expenses
  are not modelled.
- **Not tax advice.** Have a Chartered Tax Adviser review the model before
  relying on it.

## License

MIT
