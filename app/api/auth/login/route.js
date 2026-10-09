import { NextResponse } from "next/server";
import { readDB, ensureAdmin } from "../../../../lib/db";
import { checkPass, makeSession, publicUser } from "../../../../lib/auth";
import { parseJsonBody } from "../../../../lib/json";

export async function POST(req) {
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { email, password } = parsed.data;
  const em = String(email || "").toLowerCase().trim();
  const db = await readDB();
  await ensureAdmin(db);
  const u = db.users.find((x) => x.email === em);
  if (!u || !(await checkPass(String(password || ""), u.passHash)))
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await makeSession(u);
  return NextResponse.json({ user: publicUser(u) });
}
