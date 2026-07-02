import React, { useMemo, useState } from "react";
import { C, FONT_DISPLAY, FONT_BODY, NUMS, fmt } from "./theme.js";
import { SUPPLIERS, LAST_VERIFIED } from "./data/cegRates.js";
import {
  TAX_YEAR,
  EXEMPTION_PP,
  PRSI_RATE,
  STATUS_OPTIONS,
  CUTOFFS,
  personTax,
} from "./data/tax2026.js";
import {
  Field,
  NumberInput,
  Segmented,
  SectionCard,
  PersonPanel,
  inputStyle,
} from "./components/ui.jsx";

export default function App() {
  // Export calculator state
  const [exportMode, setExportMode] = useState("estimate");
  const [systemKwp, setSystemKwp] = useState(4);
  const [selfUse, setSelfUse] = useState(60);
  const [yieldPerKwp, setYieldPerKwp] = useState(900);
  const [knownExport, setKnownExport] = useState(2000);
  const [supplierIdx, setSupplierIdx] = useState(0);
  const [customRate, setCustomRate] = useState(20);

  // Household / tax state
  const [namedOnBill, setNamedOnBill] = useState(1);
  const [status, setStatus] = useState("single");
  const [persons, setPersons] = useState([
    { salary: 55000, selfEmployed: false, reducedUsc: false },
    { salary: 40000, selfEmployed: false, reducedUsc: false },
  ]);

  const setPerson = (i, p) => setPersons((prev) => prev.map((x, j) => (j === i ? p : x)));

  const results = useMemo(() => {
    const generation = Math.max(0, (Number(systemKwp) || 0) * (Number(yieldPerKwp) || 0));
    const exportKwh =
      exportMode === "estimate"
        ? generation * Math.max(0, 1 - (Number(selfUse) || 0) / 100)
        : Math.max(0, Number(knownExport) || 0);

    const supplier = SUPPLIERS[supplierIdx];
    const rate = supplier.rate === null ? Number(customRate) || 0 : supplier.rate;
    const income = (exportKwh * rate) / 100;

    const n = namedOnBill;
    const householdExemption = EXEMPTION_PP * n;
    const cutoffs = CUTOFFS[status];

    // Income splits equally between the individuals named on the bill;
    // each gets their own full €400 exemption against their share.
    const share = income / n;
    const perPerson = Array.from({ length: n }, (_, i) =>
      personTax(share, persons[i].salary, cutoffs[i], persons[i].reducedUsc, persons[i].selfEmployed)
    );

    const sum = (k) => perPerson.reduce((a, p) => a + p[k], 0);
    const excess = sum("excess");
    const totalTax = sum("total");

    return {
      exportKwh,
      generation,
      rate,
      income,
      share,
      householdExemption,
      exempt: sum("exempt"),
      excess,
      perPerson,
      it: sum("it"),
      usc: sum("usc"),
      prsi: sum("prsi"),
      totalTax,
      net: income - totalTax,
      marginalPct: excess > 0 ? (totalTax / excess) * 100 : 0,
      singleNameTax:
        n === 2
          ? personTax(income, persons[0].salary, cutoffs[0], persons[0].reducedUsc, persons[0].selfEmployed).total
          : null,
    };
  }, [exportMode, systemKwp, selfUse, yieldPerKwp, knownExport, supplierIdx, customRate, namedOnBill, status, persons]);

  const exemptFill = Math.min(1, results.income / results.householdExemption);
  const savingFromSecondName =
    results.singleNameTax !== null ? results.singleNameTax - results.totalTax : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper,
        fontFamily: FONT_BODY,
        color: C.ink,
        padding: "0 16px 60px",
      }}
    >
      <style>{`
        input:focus, select:focus { border-color: ${C.sunDeep} !important; box-shadow: 0 0 0 3px rgba(255,200,57,0.25); }
        button:focus-visible { outline: 2px solid ${C.sunDeep}; outline-offset: 2px; }
        input[type=range] { accent-color: ${C.sunDeep}; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      {/* Header */}
      <header
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "28px 0 34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
            <circle cx="17" cy="17" r="8" fill={C.sun} />
            {[...Array(8)].map((_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={17 + Math.cos(a) * 11}
                  y1={17 + Math.sin(a) * 11}
                  x2={17 + Math.cos(a) * 15}
                  y2={17 + Math.sin(a) * 15}
                  stroke={C.ink}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em" }}>
              irishsolartax<span style={{ color: C.sunDeep }}>.com</span>
            </div>
            <div style={{ fontSize: 11.5, color: C.inkSoft, letterSpacing: "0.04em" }}>
              CLEAN EXPORT GUARANTEE · TAX YEAR {TAX_YEAR}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ marginBottom: 30 }}>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              margin: "0 0 12px",
              maxWidth: 640,
            }}
          >
            What will your solar panels earn —{" "}
            <span style={{ background: `linear-gradient(transparent 62%, ${C.sun} 62%)` }}>
              and what does Revenue take?
            </span>
          </h1>
          <p style={{ fontSize: 15.5, color: C.inkSoft, maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            Estimate your Clean Export Guarantee income and see the tax due. The €400
            micro-generation exemption applies <strong>per person named on your electricity
            bill</strong> — two names means up to €800 tax-free.
          </p>
        </div>

        <div style={{ display: "grid", gap: 22 }}>
          {/* STEP 1 — Export income */}
          <SectionCard
            step="STEP 1"
            title="Your export income"
            sub="How much surplus electricity you send to the grid, and what your supplier pays for it."
          >
            <div style={{ display: "grid", gap: 18 }}>
              <Segmented
                value={exportMode}
                onChange={setExportMode}
                options={[
                  { value: "estimate", label: "Estimate from my system" },
                  { value: "known", label: "I know my export (kWh)" },
                ]}
              />

              {exportMode === "estimate" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: 16,
                  }}
                >
                  <Field label="System size" hint="Typical Irish home: 3–6 kWp">
                    <NumberInput value={systemKwp} onChange={setSystemKwp} suffix="kWp" step={0.5} />
                  </Field>
                  <Field label="Annual yield" hint="Ireland averages ~850–950 kWh per kWp">
                    <NumberInput value={yieldPerKwp} onChange={setYieldPerKwp} suffix="kWh/kWp" step={10} />
                  </Field>
                  <Field
                    label={`Self-consumption: ${selfUse}%`}
                    hint="Share you use at home. Higher with a battery or EV; the rest is exported."
                  >
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selfUse}
                      onChange={(e) => setSelfUse(Number(e.target.value))}
                      style={{ width: "100%", marginTop: 10 }}
                      aria-label="Self-consumption percentage"
                    />
                  </Field>
                </div>
              ) : (
                <div style={{ maxWidth: 300 }}>
                  <Field label="Annual export" hint="From your smart meter data or supplier bills">
                    <NumberInput value={knownExport} onChange={setKnownExport} suffix="kWh/yr" step={50} />
                  </Field>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 16,
                }}
              >
                <Field
                  label="Electricity supplier"
                  hint={`CEG rates incl. VAT, verified ${LAST_VERIFIED} — confirm with your supplier`}
                >
                  <select
                    value={supplierIdx}
                    onChange={(e) => setSupplierIdx(Number(e.target.value))}
                    style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
                  >
                    {SUPPLIERS.map((s, i) => (
                      <option key={s.name} value={i}>
                        {s.name}
                        {s.rate !== null ? ` — ${s.rate}c/kWh` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                {SUPPLIERS[supplierIdx].rate === null && (
                  <Field label="Custom export rate">
                    <NumberInput value={customRate} onChange={setCustomRate} suffix="c/kWh" step={0.1} />
                  </Field>
                )}
              </div>

              {/* Smart-meter style readout */}
              <div style={{ background: C.meterBg, borderRadius: 16, padding: "20px 22px", color: "#DCEDE2" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 18,
                  }}
                >
                  {exportMode === "estimate" && (
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.65 }}>GENERATION</div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, ...NUMS }}>
                        {Math.round(results.generation).toLocaleString("en-IE")}
                        <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}> kWh</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.65 }}>EXPORTED TO GRID</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, ...NUMS }}>
                      {Math.round(results.exportKwh).toLocaleString("en-IE")}
                      <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}> kWh</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.65 }}>RATE</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, ...NUMS }}>
                      {results.rate}
                      <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}> c/kWh</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: "0.1em", color: C.meterGlow }}>
                      EXPORT INCOME / YR
                    </div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: C.meterGlow, ...NUMS }}>
                      {fmt(results.income)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* STEP 2 — Names on the bill + exemption meter */}
          <SectionCard
            step="STEP 2"
            title="Your tax-free allowance"
            sub="Section 216D exempts the first €400 of micro-generation profits per year — per individual named on the electricity bill, not per household. Each named person gets the full €400 against their share of the income (2024–2028)."
          >
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ maxWidth: 420 }}>
                <Field
                  label="People named on the electricity bill"
                  hint="The account must genuinely be in both names — check your bill. Adding a second name to the account doubles the exemption."
                >
                  <Segmented
                    value={namedOnBill}
                    onChange={setNamedOnBill}
                    options={[
                      { value: 1, label: "1 person — €400 tax-free" },
                      { value: 2, label: "2 people — €800 tax-free" },
                    ]}
                  />
                </Field>
              </div>

              {/* Exemption meter */}
              <div
                role="img"
                aria-label={`Export income ${fmt(results.income)}: ${fmt(results.exempt)} exempt, ${fmt(results.excess)} taxable`}
              >
                <div
                  style={{
                    position: "relative",
                    height: 54,
                    borderRadius: 12,
                    background: "#EDF2EA",
                    border: `1px solid ${C.line}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "40%",
                      background:
                        "repeating-linear-gradient(45deg, rgba(255,200,57,0.18) 0 8px, rgba(255,200,57,0.32) 8px 16px)",
                      borderRight: `2px dashed ${C.sunDeep}`,
                    }}
                  />
                  {namedOnBill === 2 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "20%",
                        top: 8,
                        bottom: 8,
                        width: 0,
                        borderLeft: "1.5px dashed rgba(232,162,0,0.55)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      bottom: 6,
                      width: `calc(${exemptFill * 40}% - ${exemptFill > 0 ? 6 : 0}px)`,
                      marginLeft: 6,
                      background: C.sun,
                      borderRadius: 7,
                      transition: "width 300ms ease",
                    }}
                  />
                  {results.excess > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "40%",
                        top: 6,
                        bottom: 6,
                        width: `${Math.min(58, (results.excess / (results.householdExemption * 1.5)) * 60)}%`,
                        background: C.tax,
                        borderRadius: 7,
                        marginLeft: 2,
                        transition: "width 300ms ease",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      left: "40%",
                      top: -1,
                      transform: "translateX(-50%)",
                      fontFamily: FONT_DISPLAY,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: C.sunDeep,
                      background: C.card,
                      padding: "1px 6px",
                      borderRadius: 5,
                      border: `1px solid ${C.line}`,
                    }}
                  >
                    {namedOnBill === 2 ? "€400 × 2 = €800" : "€400"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    fontSize: 13,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span>
                    <span style={{ display: "inline-block", width: 10, height: 10, background: C.sun, borderRadius: 3, marginRight: 6 }} />
                    Tax-free: <strong style={NUMS}>{fmt(results.exempt)}</strong>
                    {namedOnBill === 2 && (
                      <span style={{ color: C.inkSoft }}> ({fmt(Math.min(results.share, EXEMPTION_PP))} each)</span>
                    )}
                  </span>
                  <span>
                    <span style={{ display: "inline-block", width: 10, height: 10, background: C.tax, borderRadius: 3, marginRight: 6 }} />
                    Taxable excess: <strong style={NUMS}>{fmt(results.excess)}</strong>
                  </span>
                </div>

                {results.excess === 0 && results.income > 0 && (
                  <p
                    style={{
                      marginTop: 14,
                      marginBottom: 0,
                      padding: "12px 14px",
                      background: "rgba(255,200,57,0.16)",
                      borderRadius: 10,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                    }}
                  >
                    Fully covered by the exemption{namedOnBill === 2 ? "s" : ""}. Nothing to declare —
                    exempt profits don't even need to go on a tax return.
                  </p>
                )}

                {namedOnBill === 1 && results.income > EXEMPTION_PP && (
                  <p
                    style={{
                      marginTop: 14,
                      marginBottom: 0,
                      padding: "12px 14px",
                      background: "rgba(43,91,168,0.08)",
                      border: "1px solid rgba(43,91,168,0.25)",
                      borderRadius: 10,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                    }}
                  >
                    <strong>Sharing the bill?</strong> If a second person were named on the electricity
                    account, the household exemption would double to €800
                    {results.income <= EXEMPTION_PP * 2
                      ? " — which would make this income fully tax-free."
                      : ` and the taxable excess would drop to ${fmt(Math.max(0, results.income - EXEMPTION_PP * 2))}.`}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* STEP 3 — Tax on the excess */}
          <SectionCard
            step="STEP 3"
            title="Tax on the excess"
            sub={
              namedOnBill === 2
                ? "The income splits between the two named people. Each person's excess over their €400 is taxed at their own marginal rates — so both salaries matter."
                : "The excess is taxed as income at your marginal rates. Your salary determines which bands it lands in."
            }
          >
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ maxWidth: 420 }}>
                <Field label="Tax status">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    namedOnBill === 2 ? "repeat(auto-fit, minmax(260px, 1fr))" : "minmax(260px, 420px)",
                  gap: 16,
                }}
              >
                {Array.from({ length: namedOnBill }, (_, i) => (
                  <PersonPanel
                    key={i}
                    label={`PERSON ${i === 0 ? "A" : "B"} — named on bill`}
                    showLabel={namedOnBill === 2}
                    person={persons[i]}
                    onChange={(p) => setPerson(i, p)}
                    cutoff={CUTOFFS[status][i]}
                  />
                ))}
              </div>

              {namedOnBill === 2 && results.excess > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {results.perPerson.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        border: `1px solid ${C.line}`,
                        borderRadius: 12,
                        padding: "12px 16px",
                        fontSize: 13.5,
                        background: "#FBFDFA",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: "0.08em",
                          color: C.sunDeep,
                          marginBottom: 6,
                        }}
                      >
                        PERSON {i === 0 ? "A" : "B"}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", ...NUMS }}>
                        <span style={{ color: C.inkSoft }}>Share of income</span>
                        <span>{fmt(results.share, 2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", ...NUMS }}>
                        <span style={{ color: C.inkSoft }}>Taxable excess</span>
                        <span>{fmt(p.excess, 2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: 4, ...NUMS }}>
                        <span>Tax due</span>
                        <span style={{ color: C.tax }}>{fmt(p.total, 2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
                {[
                  { label: "Income tax", value: results.it },
                  { label: "USC", value: results.usc },
                  { label: `PRSI (${(PRSI_RATE * 100).toFixed(1)}%)`, value: results.prsi },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderBottom: `1px solid ${C.line}`,
                      fontSize: 14.5,
                    }}
                  >
                    <span style={{ color: C.inkSoft }}>{row.label}</span>
                    <span style={{ fontWeight: 600, ...NUMS }}>{fmt(row.value, 2)}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 18px",
                    background: "#F2F6F0",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>
                      Total tax owed{namedOnBill === 2 ? " (both people)" : ""}
                    </div>
                    {results.excess > 0 && (
                      <div style={{ fontSize: 12, color: C.inkSoft }}>
                        ≈ {results.marginalPct.toFixed(1)}% effective rate on the excess
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 26,
                      fontWeight: 700,
                      color: results.totalTax > 0 ? C.tax : C.ink,
                      ...NUMS,
                    }}
                  >
                    {fmt(results.totalTax, 2)}
                  </div>
                </div>
              </div>

              {namedOnBill === 2 && savingFromSecondName > 0.5 && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(255,200,57,0.16)",
                    borderRadius: 10,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                  }}
                >
                  Having both names on the bill saves{" "}
                  <strong style={NUMS}>{fmt(savingFromSecondName, 2)}</strong> a year versus a
                  single-name account.
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  background: C.meterBg,
                  color: "#DCEDE2",
                  borderRadius: 14,
                  padding: "18px 22px",
                }}
              >
                <div style={{ fontSize: 14 }}>
                  Net export income after tax
                  {results.excess > 0 && (
                    <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                      {namedOnBill === 2
                        ? "Each person declares their own excess on Form 12 / Form 11"
                        : `Declare the ${fmt(results.excess)} excess on Form 12 / Form 11`}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 32,
                    fontWeight: 700,
                    color: C.meterGlow,
                    ...NUMS,
                  }}
                >
                  {fmt(results.net)}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 34, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Estimates only — not tax or financial advice.</strong> Based on the s216D
            micro-generation exemption (Revenue TDM Part 07-01-44): €400/yr per qualifying
            individual for 2024–2028, where each person named on the electricity bill can claim the
            full exemption. This tool splits export income equally between named persons. {TAX_YEAR}{" "}
            rates: income tax 20%/40%, USC 0.5%/2%/3%/8% (2% band to €28,700, exempt ≤ €13,000),
            employee PRSI 4.2% (4.35% from 1 Oct 2026 — not modelled). Married two-income band
            sharing is approximated at €44,000 per spouse. PRSI on small amounts of unearned income
            varies; revenue expenses (not capital costs like the panels) can reduce taxable profit.
            CEG rates change frequently — confirm with your supplier and Revenue.
          </p>
        </footer>
      </main>
    </div>
  );
}
