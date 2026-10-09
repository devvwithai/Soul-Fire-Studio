import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/auth";
import { readDB, updateDB, ORDER_STATUSES } from "../../../../lib/db";

export async function GET(req) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const db = await readDB();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = url.searchParams.get("status") || "";

  const allOrders = [...db.orders].sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  const revenue = allOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  let orders = allOrders;
  if (status && status !== "All") orders = orders.filter((o) => o.status === status);
  if (q) {
    orders = orders.filter((o) => {
      const hay = [
        o.id, o.customer, o.email, o.status, o.paymentStatus,
        o.address?.city, o.address?.pincode, o.address?.phone, o.address?.name,
        ...(o.items || []).map((i) => i.name),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  // Design lookup so the admin UI can label per-order design downloads.
  const designs = {};
  for (const d of db.designs || []) designs[d.id] = { id: d.id, name: d.name, createdAt: d.createdAt, userId: d.userId };

  // Customer list with aggregated order stats (never expose password hashes).
  const byUser = new Map();
  for (const o of allOrders) {
    const key = o.userId || o.email;
    if (!byUser.has(key)) byUser.set(key, { orderCount: 0, totalSpend: 0, lastOrderAt: null });
    const agg = byUser.get(key);
    agg.orderCount += 1;
    if (o.status !== "Cancelled") agg.totalSpend += o.total || 0;
    if (!agg.lastOrderAt || o.createdAt > agg.lastOrderAt) agg.lastOrderAt = o.createdAt;
  }
  const customers = db.users
    .filter((u) => u.role !== "admin")
    .map((u) => {
      const agg = byUser.get(u.id) || byUser.get(u.email) || { orderCount: 0, totalSpend: 0, lastOrderAt: null };
      return {
        id: u.id, name: u.name, email: u.email, phone: u.phone || "",
        createdAt: u.createdAt || null,
        addressCount: (u.addresses || []).length,
        wishlistCount: (u.wishlist || []).length,
        ...agg,
      };
    })
    .sort((x, y) => (y.lastOrderAt || y.createdAt || "").localeCompare(x.lastOrderAt || x.createdAt || ""));

  const lowStock = db.products.filter((p) => typeof p.stock === "number" && p.stock <= 10).map((p) => ({ id: p.id, name: p.name, stock: p.stock, active: p.active }));

  return NextResponse.json({
    orders,
    customers,
    designs,
    stats: { count: allOrders.length, revenue, customers: db.users.filter((u) => u.role !== "admin").length, lowStockCount: lowStock.length, lowStock },
  });
}

export async function PATCH(req) {
  const a = await requireAdmin();
  if (!a) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id, statusIdx } = await req.json();
  const order = await updateDB((db) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o) return null;
    o.statusIdx = Math.max(0, Math.min(ORDER_STATUSES.length - 1, Number(statusIdx)));
    o.status = ORDER_STATUSES[o.statusIdx];
    o.timeline = [...o.timeline.filter((t) => t.status !== o.status), { status: o.status, at: new Date().toISOString() }];
    return o;
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
