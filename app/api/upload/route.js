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
  // Images only — anything else (HTML/SVG/scripts) must never reach the store,
  // because the raw route serves files back from this origin to logged-in users.
  const okTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  const okExt = /\.(png|jpe?g|webp|gif)$/i;
  if (!okTypes.includes(file.type) || !okExt.test(file.name || "")) {
    return NextResponse.json({ error: "Please upload a PNG, JPG, WEBP or GIF image." }, { status: 400 });
  }
  const safe = (file.name || "design.png").replace(/[^a-zA-Z0-9._-]/g, "_");
  const putRes = await put(`designs/${u.id}/${Date.now()}-${safe}`, file, { access: "private", addRandomSuffix: true });
  const pathname = putRes.pathname;
  const design = await updateDB((db) => {
    const d = { id: uid("d_"), userId: u.id, pathname, name: file.name || "My design", size: file.size, createdAt: new Date().toISOString() };
    db.designs.push(d);
    return d;
  });
  return NextResponse.json({ design: { id: design.id, name: design.name, createdAt: design.createdAt } });
}
