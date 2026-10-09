import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { readDB, updateDB } from "../../../../lib/db";

export async function GET() {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const db = await readDB();
  return NextResponse.json({ coupons: db.coupons || [] });
}

export async function POST(req) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { code, pct } = await req.json();
  const clean = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  const p = Math.max(1, Math.min(90, Number(pct) || 0));
  if (!clean || !p) return NextResponse.json({ error: "Give a code and a discount % (1–90)." }, { status: 400 });
  const coupons = await updateDB((db) => {
    db.coupons = db.coupons || [];
    if (db.coupons.some((x) => x.code === clean)) throw new Error("EXISTS");
    db.coupons.push({ code: clean, pct: p, active: true });
    return db.coupons;
  }).catch((e) => (e.message === "EXISTS" ? null : Promise.reject(e)));
  if (!coupons) return NextResponse.json({ error: "That code already exists." }, { status: 409 });
  return NextResponse.json({ coupons });
}

export async function PATCH(req) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { code, active } = await req.json();
  const coupons = await updateDB((db) => {
    const c = (db.coupons || []).find((x) => x.code === code);
    if (c) c.active = !!active;
    return db.coupons;
  });
  return NextResponse.json({ coupons });
}
