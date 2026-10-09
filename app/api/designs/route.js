import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { readDB } from "../../../lib/db";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const db = await readDB();
  const mine = db.designs
    .filter((d) => d.userId === u.id)
    .map(({ id, name, createdAt }) => ({ id, name, createdAt }));
  return NextResponse.json({ designs: mine });
}
