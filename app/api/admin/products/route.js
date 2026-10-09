import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { updateDB } from "../../../../lib/db";

export async function PATCH(req) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id, price, mrp, stock, active, name } = await req.json();
  const product = await updateDB((db) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return null;
    if (price !== undefined) p.price = Math.max(1, Number(price));
    if (mrp !== undefined) p.mrp = Math.max(1, Number(mrp));
    if (stock !== undefined) p.stock = Math.max(0, Number(stock));
    if (active !== undefined) p.active = !!active;
    if (name) p.name = String(name);
    return p;
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}
