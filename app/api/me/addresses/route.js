import { NextResponse } from "next/server";
import { currentUser, publicUser } from "../../../../lib/auth";
import { updateDB, uid } from "../../../../lib/db";
import { parseJsonBody } from "../../../../lib/json";

export async function POST(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const a = parsed.data;
  if (!a.name || !a.phone || !a.pincode || !a.line || !a.city || !a.state)
    return NextResponse.json({ error: "Please fill all address fields." }, { status: 400 });
  const updated = await updateDB((db) => {
    const me = db.users.find((x) => x.id === u.id);
    const addr = {
      id: uid("addr_"), name: a.name, phone: a.phone, pincode: String(a.pincode),
      line: a.line, city: a.city, state: a.state, landmark: a.landmark || "",
      isDefault: me.addresses.length === 0 || !!a.isDefault,
    };
    if (addr.isDefault) me.addresses.forEach((x) => (x.isDefault = false));
    me.addresses.push(addr);
    return me;
  });
  return NextResponse.json({ user: publicUser(updated) });
}

export async function DELETE(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const updated = await updateDB((db) => {
    const me = db.users.find((x) => x.id === u.id);
    me.addresses = me.addresses.filter((x) => x.id !== id);
    if (me.addresses.length && !me.addresses.some((x) => x.isDefault)) me.addresses[0].isDefault = true;
    return me;
  });
  return NextResponse.json({ user: publicUser(updated) });
}
