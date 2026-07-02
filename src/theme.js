export const C = {
  paper: "#F4F7F1",
  card: "#FFFFFF",
  ink: "#11362B",
  inkSoft: "#4A6157",
  line: "#DCE5DC",
  sun: "#FFC839",
  sunDeep: "#E8A200",
  meterBg: "#0E2D24",
  meterGlow: "#7BE8A8",
  tax: "#2B5BA8",
};

export const FONT_DISPLAY = "'Space Grotesk','Avenir Next','Segoe UI',sans-serif";
export const FONT_BODY = "'Inter','Helvetica Neue',Arial,sans-serif";
export const NUMS = { fontVariantNumeric: "tabular-nums" };

export const fmt = (n, dp = 0) =>
  "€" +
  n.toLocaleString("en-IE", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
