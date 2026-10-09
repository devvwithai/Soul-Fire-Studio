import { NextResponse } from "next/server";
import { readDB, ensureAdmin } from "../../../lib/db";

export async function POST(req) {
  const { orderId, email } = await req.json();
  const db = await readDB();
  await ensureAdmin(db);
  const o = db.orders.find((x) => x.id === String(orderId || "").toUpperCase().trim());
  if (!o || o.email.toLowerCase() !== String(email || "").toLowerCase().trim())
    return NextResponse.json({ error: "No order found with that ID and email." }, { status: 404 });
  const { userId, ...safe } = o;
  return NextResponse.json({ order: safe });
}
