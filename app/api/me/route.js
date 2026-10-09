import { NextResponse } from "next/server";
import { currentUser, publicUser } from "../../../lib/auth";
import { updateDB } from "../../../lib/db";
import { parseJsonBody } from "../../../lib/json";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: publicUser(u) });
}

export async function PATCH(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  const updated = await updateDB((db) => {
    const me = db.users.find((x) => x.id === u.id);
    if (body.name) me.name = String(body.name).trim();
    if (body.phone !== undefined) me.phone = String(body.phone).trim();
    if (body.dob !== undefined) me.dob = body.dob;
    if (body.settings) me.settings = { ...me.settings, ...body.settings };
    return me;
  });
  return NextResponse.json({ user: publicUser(updated) });
}
