import { NextResponse } from "next/server";
import { readDB } from "../../../../lib/db";
import { parseJsonBody } from "../../../../lib/json";

export async function POST(req) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { code } = parsed.data;
  const db = await readDB();
  const c = (db.coupons || []).find((x) => x.code === String(code || "").toUpperCase().trim() && x.active);
  if (!c) return NextResponse.json({ error: "That coupon code is not valid or has expired." }, { status: 404 });
  return NextResponse.json({ coupon: { code: c.code, pct: c.pct } });
}
