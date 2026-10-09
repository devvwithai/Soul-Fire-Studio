import { NextResponse } from "next/server";
import { readDB, ensureAdmin } from "../../../lib/db";

export async function GET() {
  const db = await readDB();
  await ensureAdmin(db);
  return NextResponse.json(
    { products: db.products.filter((p) => p.active) },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
