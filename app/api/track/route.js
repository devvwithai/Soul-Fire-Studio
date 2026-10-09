import { NextResponse } from "next/server";
import { readDB, ensureAdmin } from "../../../lib/db";
import { parseJsonBody } from "../../../lib/json";

export async function POST(req) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { orderId, email } = parsed.data;
  const db = await readDB();
  await ensureAdmin(db);
  const o = db.orders.find((x) => x.id === String(orderId || "").toUpperCase().trim());
  if (!o || o.email.toLowerCase() !== String(email || "").toLowerCase().trim())
    return NextResponse.json({ error: "No order found with that ID and email." }, { status: 404 });
  // Public tracking must never leak the delivery address or phone — order ID +
  // email is a weak secret, so return status/items/totals + coarse location only.
  const { userId, address, giftNote, ...rest } = o;
  const safe = {
    ...rest,
    address: address ? { city: address.city, state: address.state, pincode: address.pincode } : undefined,
  };
  return NextResponse.json({ order: safe });
}
