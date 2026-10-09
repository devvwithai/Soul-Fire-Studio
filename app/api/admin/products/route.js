import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { updateDB } from "../../../../lib/db";

export async function PATCH(req) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id, price, mrp, stock, active, name } = await req.json();
  for (const v of [price, mrp, stock]) {
    if (v !== undefined && !Number.isFinite(Number(v)))
      return NextResponse.json({ error: "Price, MRP and stock must be numbers." }, { status: 400 });
  }
  const product = await updateDB((db) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return null;
    const num = (v, min) => { const n = Number(v); return Number.isFinite(n) ? Math.max(min, n) : null; };
    if (price !== undefined) { const n = num(price, 1); if (n === null) throw new Error("BAD_NUMBER"); p.price = n; }
    if (mrp !== undefined) { const n = num(mrp, 1); if (n === null) throw new Error("BAD_NUMBER"); p.mrp = n; }
    if (stock !== undefined) { const n = num(stock, 0); if (n === null) throw new Error("BAD_NUMBER"); p.stock = n; }
    if (active !== undefined) p.active = !!active;
    if (name) p.name = String(name);
    return p;
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}
