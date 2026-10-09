import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";
import { updateDB, readDB, ORDER_STATUSES } from "../../../lib/db";
import { deliveryCharge } from "../../../lib/pricing";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const db = await readDB();
  const mine = db.orders.filter((o) => o.userId === u.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ orders: mine });
}

export async function POST(req) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { items, addressId, giftWrap, giftNote, orderNote, couponCode } = await req.json();
  if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  const order = await updateDB((db) => {
    const me = db.users.find((x) => x.id === u.id);
    const addr = me.addresses.find((a) => a.id === addressId) || me.addresses.find((a) => a.isDefault);
    if (!addr) throw new Error("NO_ADDRESS");
    let subtotal = 0;
    let hasHeavy = false;
    // Aggregate quantities per product FIRST — duplicate lines of the same
    // product must not each pass the stock check while summing past stock.
    const wanted = {};
    for (const it of items) {
      const q = Math.max(1, Math.min(100, Number(it.qty) || 1));
      wanted[it.productId] = (wanted[it.productId] || 0) + q;
    }
    for (const [pid, q] of Object.entries(wanted)) {
      const p = db.products.find((x) => x.id === pid && x.active);
      if (!p) throw new Error("BAD_PRODUCT");
      if (typeof p.stock === "number" && p.stock < q) throw new Error("OUT_OF_STOCK:" + p.name);
    }
    const lines = items.map((it) => {
      const p = db.products.find((x) => x.id === it.productId && x.active);
      const qty = Math.max(1, Math.min(100, Number(it.qty) || 1));
      let unit = p.price;
      if (p.id === "keychain" && String(it.option || "").startsWith("Double")) unit += 50;
      subtotal += unit * qty;
      if (p.weight >= 1) hasHeavy = true;
      return {
        productId: p.id, name: p.name, img: p.img, unit, qty,
        option: it.option || (p.options?.values?.[0] ?? ""),
        customText: it.customText || "",
        // Only honour design IDs that actually belong to this customer.
        designId: it.designId && db.designs.some((d) => d.id === it.designId && d.userId === u.id) ? it.designId : null,
      };
    });
    let coupon = null;
    let discount = 0;
    if (couponCode) {
      const c = (db.coupons || []).find((x) => x.code === String(couponCode).toUpperCase().trim() && x.active);
      if (!c) throw new Error("BAD_COUPON");
      discount = Math.round((subtotal * c.pct) / 100);
      coupon = { code: c.code, pct: c.pct, discount };
    }
    const delivery = deliveryCharge(addr.pincode, hasHeavy, subtotal - discount);
    const wrapFee = giftWrap ? 49 : 0;
    db.seq.order += 1;
    const o = {
      id: "SF" + db.seq.order,
      userId: u.id, email: u.email, customer: me.name,
      items: lines, address: addr,
      subtotal, delivery, giftWrap: !!giftWrap, giftNote: giftNote || "", wrapFee,
      orderNote: String(orderNote || "").slice(0, 500), coupon, discount,
      total: subtotal - discount + delivery + wrapFee,
      payment: "UPI (Demo)", paymentStatus: "Paid · Demo",
      statusIdx: 0, status: ORDER_STATUSES[0],
      timeline: [{ status: ORDER_STATUSES[0], at: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    // Decrement stock now that every line has validated.
    for (const l of lines) {
      const p = db.products.find((x) => x.id === l.productId);
      if (p && typeof p.stock === "number") p.stock = Math.max(0, p.stock - l.qty);
    }
    db.orders.push(o);
    return o;
  }).catch((e) => {
    if (e.message === "BAD_COUPON") return { couponError: true };
    if (e.message === "NO_ADDRESS") return null;
    if (e.message && e.message.startsWith("OUT_OF_STOCK:")) return { stockError: e.message.slice("OUT_OF_STOCK:".length) };
    throw e;
  });
  if (order && order.couponError) return NextResponse.json({ error: "That coupon code is not valid or has expired." }, { status: 400 });
  if (order && order.stockError) return NextResponse.json({ error: `Sorry — ${order.stockError} doesn't have enough stock left for that quantity. Lower the quantity or check back after a restock.` }, { status: 400 });
  if (!order) return NextResponse.json({ error: "Please add a delivery address first." }, { status: 400 });
  return NextResponse.json({ order });
}
