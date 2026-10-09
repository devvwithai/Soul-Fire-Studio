import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { readDB, ensureAdmin, publicUser } from "./db";

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
export const COOKIE = "sf_session";

export async function hashPass(p) {
  return bcrypt.hash(p, 10);
}
export async function checkPass(p, h) {
  return bcrypt.compare(p, h);
}

export async function makeSession(user) {
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  const c = await cookies();
  c.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function currentUser() {
  try {
    const c = await cookies();
    const token = c.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    const db = await readDB();
    await ensureAdmin(db);
    const u = db.users.find((x) => x.id === payload.uid);
    return u || null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const u = await currentUser();
  return u;
}

export async function requireAdmin() {
  const u = await currentUser();
  return u && u.role === "admin" ? u : null;
}

export { publicUser };
