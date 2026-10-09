import { NextResponse } from "next/server";
import { readDB, ensureAdmin } from "../../../lib/db";

export async function GET() {
  const db = await readDB();
  await ensureAdmin(db);
  return NextResponse.json({ products: db.products.filter((p) => p.active) });
}
