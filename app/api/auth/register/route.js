import { NextResponse } from "next/server";
import { updateDB, uid } from "../../../../lib/db";
import { hashPass, makeSession, publicUser } from "../../../../lib/auth";

export async function POST(req) {
  const { name, email, phone, password } = await req.json();
  const em = String(email || "").toLowerCase().trim();
  if (!name || !em || !password || password.length < 6)
    return NextResponse.json({ error: "Name, email and a 6+ character password are required." }, { status: 400 });
  let user;
  try {
    user = await updateDB(async (db) => {
      if (db.users.some((u) => u.email === em)) throw new Error("EXISTS");
      const u = {
        id: uid("u_"), name: String(name).trim(), email: em, phone: String(phone || "").trim(),
        passHash: await hashPass(password), role: "customer",
        wishlist: [], addresses: [], settings: { offers: true, orderUpdates: true },
        createdAt: new Date().toISOString(),
      };
      db.users.push(u);
      return u;
    });
  } catch (e) {
    if (e.message === "EXISTS") return NextResponse.json({ error: "An account with this email already exists. Please login." }, { status: 409 });
    throw e;
  }
  await makeSession(user);
  return NextResponse.json({ user: publicUser(user) });
}
