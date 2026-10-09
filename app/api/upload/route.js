import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { currentUser } from "../../../lib/auth";
import { updateDB, uid } from "../../../lib/db";

export async function POST(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required to upload a design." }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 12MB)." }, { status: 400 });
  const safe = (file.name || "design.png").replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `designs/${u.id}/${Date.now()}-${safe}`;
  await put(pathname, file, { access: "private", addRandomSuffix: false });
  const design = await updateDB((db) => {
    const d = { id: uid("d_"), userId: u.id, pathname, name: file.name || "My design", size: file.size, createdAt: new Date().toISOString() };
    db.designs.push(d);
    return d;
  });
  return NextResponse.json({ design: { id: design.id, name: design.name, createdAt: design.createdAt } });
}
