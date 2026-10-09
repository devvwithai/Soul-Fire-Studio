export const FREE_SHIPPING = 699;

/** Delivery charge using the studio's contracted Delhivery D2C rates from 743355.
 *  Light (≤0.5kg class): ₹49 WB / ₹69 rest of India. Heavy (1kg class): ₹89 / ₹132. */
/** West Bengal pincodes run 700xxx–743xxx. Odisha (751+), Assam/NE (78x/79x)
 *  are NOT WB and must not get WB rates. */
export function isWB(pincode) {
  const n = parseInt(String(pincode || "").slice(0, 3), 10);
  return n >= 700 && n <= 743;
}

export function deliveryCharge(pincode, hasHeavy, subtotal) {
  if (subtotal >= FREE_SHIPPING) return 0;
  const wb = isWB(pincode);
  if (hasHeavy) return wb ? 89 : 132;
  return wb ? 49 : 69;
}

export function deliveryEstimate(pincode) {
  const wb = isWB(pincode);
  const prodDays = 2;
  const transitMin = wb ? 1 : 3;
  const transitMax = wb ? 3 : 5;
  const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const a = new Date(Date.now() + (prodDays + transitMin) * 864e5);
  const b = new Date(Date.now() + (prodDays + transitMax) * 864e5);
  return `${fmt(a)} – ${fmt(b)}`;
}

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
