import React from "react";
import { C, FONT_DISPLAY, FONT_BODY, NUMS, fmt } from "../theme.js";

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  fontSize: 16,
  fontFamily: FONT_BODY,
  color: C.ink,
  background: "#FDFEFC",
  border: `1.5px solid ${C.line}`,
  borderRadius: 10,
  outline: "none",
  ...NUMS,
};

export function Field({ label, hint, children }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: C.ink,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 5, lineHeight: 1.45 }}>
          {hint}
        </div>
      )}
    </label>
  );
}

export function NumberInput({ value, onChange, prefix, suffix, step = 1, min = 0 }) {
  return (
    <div style={{ position: "relative" }}>
      {prefix && (
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.inkSoft,
            fontSize: 15,
          }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        inputMode="decimal"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{ ...inputStyle, paddingLeft: prefix ? 26 : 12, paddingRight: suffix ? 62 : 12 }}
      />
      {suffix && (
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.inkSoft,
            fontSize: 13,
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div
      role="tablist"
      style={{ display: "flex", gap: 4, background: "#E9EFE7", borderRadius: 12, padding: 4 }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              padding: "9px 10px",
              fontSize: 13.5,
              fontWeight: active ? 700 : 500,
              fontFamily: FONT_DISPLAY,
              color: active ? C.ink : C.inkSoft,
              background: active ? "#FFFFFF" : "transparent",
              border: "none",
              borderRadius: 9,
              cursor: "pointer",
              boxShadow: active ? "0 1px 3px rgba(17,54,43,0.15)" : "none",
              transition: "all 120ms ease",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionCard({ step, title, sub, children }) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        padding: "26px 24px",
        boxShadow: "0 2px 10px rgba(17,54,43,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: C.sunDeep,
          }}
        >
          {step}
        </span>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 22,
            fontWeight: 700,
            color: C.ink,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      </div>
      {sub && (
        <p style={{ fontSize: 13.5, color: C.inkSoft, margin: "2px 0 20px", lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
      {children}
    </section>
  );
}

export function PersonPanel({ label, person, onChange, cutoff, showLabel }) {
  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: "16px 16px 14px",
        background: "#FBFDFA",
      }}
    >
      {showLabel && (
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: C.sunDeep,
            marginBottom: 12,
          }}
        >
          {label}
        </div>
      )}
      <Field label="Gross salary / income" hint={`20% band up to ${fmt(cutoff)}, 40% above`}>
        <NumberInput
          value={person.salary}
          onChange={(v) => onChange({ ...person, salary: v })}
          prefix="€"
          step={1000}
        />
      </Field>
      <div style={{ display: "grid", gap: 8, marginTop: 12, fontSize: 13.5 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={person.selfEmployed}
            onChange={(e) => onChange({ ...person, selfEmployed: e.target.checked })}
          />
          Self-employed (3% USC surcharge over €100k)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={person.reducedUsc}
            onChange={(e) => onChange({ ...person, reducedUsc: e.target.checked })}
          />
          Aged 70+ or full medical card (income ≤ €60k)
        </label>
      </div>
    </div>
  );
}
