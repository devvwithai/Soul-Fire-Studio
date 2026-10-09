import { NextResponse } from "next/server";
import { currentUser, publicUser } from "../../../../lib/auth";
import { updateDB } from "../../../../lib/db";
import { parseJsonBody } from "../../../../lib/json";

export async function POST(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = await parseJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const { productId } = parsed.data;
  const updated = await updateDB((db) => {
    const me = db.users.find((x) => x.id === u.id);
    me.wishlist = me.wishlist.includes(productId)
      ? me.wishlist.filter((x) => x !== productId)
      : [...me.wishlist, productId];
    return me;
  });
  return NextResponse.json({ user: publicUser(updated) });
}
