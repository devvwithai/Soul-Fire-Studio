import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";
import { readDB } from "../../../../lib/db";

export async function GET(_req, { params }) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const db = await readDB();
  const o = db.orders.find((x) => x.id === id);
  if (!o || (o.userId !== u.id && u.role !== "admin")) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order: o });
}
