import { get } from "@vercel/blob";
import { currentUser } from "../../../../../lib/auth";
import { readDB } from "../../../../../lib/db";

export async function GET(req, { params }) {
  const u = await currentUser();
  if (!u) return new Response("Login required", { status: 401 });
  const { id } = await params;
  const db = await readDB();
  const d = db.designs.find((x) => x.id === id);
  if (!d || (d.userId !== u.id && u.role !== "admin")) return new Response("Not found", { status: 404 });
  const res = await get(d.pathname, { access: "private" });
  if (!res || !res.stream) return new Response("Not found", { status: 404 });
  const download = new URL(req.url).searchParams.get("download") === "1";
  const safeName = String(d.name || "design").replace(/[^a-zA-Z0-9._-]/g, "_");
  const headers = { "Content-Type": res.blob.contentType || "application/octet-stream", "Cache-Control": "private, max-age=300" };
  if (download) headers["Content-Disposition"] = `attachment; filename="${safeName}"`;
  return new Response(res.stream, { headers });
}
