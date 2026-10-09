import { NextResponse } from "next/server";
import { currentUser, checkPass, hashPass } from "../../../../lib/auth";
import { updateDB } from "../../../../lib/db";

export async function POST(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { current, next } = await req.json();
  if (!next || next.length < 6) return NextResponse.json({ error: "New password must be 6+ characters." }, { status: 400 });
  if (!(await checkPass(String(current || ""), u.passHash)))
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
  const hash = await hashPass(next);
  await updateDB((db) => {
    db.users.find((x) => x.id === u.id).passHash = hash;
  });
  return NextResponse.json({ ok: true });
}
