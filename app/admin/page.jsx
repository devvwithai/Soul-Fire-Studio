"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "../../components/StoreContext";
import { inr } from "../../lib/pricing";

const STATUSES = ["Placed", "Design Proof", "Printing", "Quality Check", "Packed", "Dispatched", "Out for Delivery", "Delivered"];
const LOW_STOCK_AT = 10;

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch { return "—"; }
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }); } catch { return "—"; }
}

export default function Admin() {
  const { user } = useStore();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("orders");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [custQuery, setCustQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: "", pct: 10 });

  const load = () => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => { if (d.orders) setData(d); else setErr(d.error || "Not authorised"); });
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
    fetch("/api/admin/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons || []));
  };
  const toggleCoupon = async (c) => {
    const r = await fetch("/api/admin/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c.code, active: !c.active }) });
    const d = await r.json();
    if (d.coupons) setCoupons(d.coupons);
  };
  const addCoupon = async () => {
    const r = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCoupon) });
    const d = await r.json();
    if (d.coupons) { setCoupons(d.coupons); setNewCoupon({ code: "", pct: 10 }); }
    else setErr(d.error || "Could not add coupon");
  };
  useEffect(() => {
    if (user === null) router.push("/login?next=/admin");
    if (user && user.role !== "admin") router.push("/account");
    if (user?.role === "admin") load();
  }, [user, router]);

  const advance = async (o, dir) => {
    const r = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, statusIdx: o.statusIdx + dir }) });
    if (r.ok) load();
  };
  const setStatus = async (o, idx) => {
    const r = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, statusIdx: idx }) });
    if (r.ok) load();
  };
  const editProduct = async (p, field, value) => {
    const r = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, [field]: value }) });
    if (r.ok) load();
  };

  const orders = data?.orders || [];
  const designs = data?.designs || {};
  const customers = data?.customers || [];

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [o.id, o.customer, o.email, o.status, o.address?.city, o.address?.pincode, o.address?.phone, ...(o.items || []).map((i) => i.name)].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [orders, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const m = { All: orders.length };
    for (const o of orders) m[o.status] = (m[o.status] || 0) + 1;
    return m;
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    const q = custQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [customers, custQuery]);

  const lowStockProducts = useMemo(() => products.filter((p) => typeof p.stock === "number" && p.stock <= LOW_STOCK_AT), [products]);
  const visibleProducts = useMemo(() => (lowOnly ? lowStockProducts : products), [lowOnly, lowStockProducts, products]);

  if (!user || user.role !== "admin") return <div className="wrap page"><p className="lead">Admins only — checking your access…</p></div>;
  return (
    <div className="wrap page">
      <span className="kicker">Studio Control Room</span>
      <h2 className="page-title">Admin <span className="hl">panel</span></h2>
      {err && <p className="err">{err}</p>}
      {data && (
        <div className="acct-stats" style={{ marginBottom: 20 }}>
          <div className="stat"><b>{data.stats.count}</b><span>total orders</span></div>
          <div className="stat"><b>{inr(data.stats.revenue)}</b><span>revenue (demo)</span></div>
          <div className="stat"><b>{data.stats.customers}</b><span>registered customers</span></div>
          <div className="stat"><b>{data.stats.lowStockCount ?? lowStockProducts.length}</b><span>products low on stock</span></div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="lowstock-banner" role="alert">
          <b>Low stock — restock soon:</b>{" "}
          {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(" · ")}
          <button type="button" onClick={() => { setTab("products"); setLowOnly(true); }}>Review stock →</button>
        </div>
      )}

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        <button type="button" className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>Orders ({orders.length})</button>
        <button type="button" className={tab === "customers" ? "on" : ""} onClick={() => setTab("customers")}>Customers ({customers.length})</button>
        <button type="button" className={tab === "products" ? "on" : ""} onClick={() => setTab("products")}>Products &amp; Stock</button>
        <button type="button" className={tab === "coupons" ? "on" : ""} onClick={() => setTab("coupons")}>Coupons ({coupons.length})</button>
      </div>

      {tab === "orders" && (
        <div className="panel">
          <h3>Orders — move them through the pipeline</h3>
          <div className="admin-toolbar">
            <input className="inp" type="search" placeholder="Search order ID, customer, email, phone, city, pincode or product…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search orders" />
            <span className="muted">{filteredOrders.length} of {orders.length} orders</span>
          </div>
          <div className="chips" style={{ marginBottom: 14 }}>
            {["All", ...STATUSES].map((s) => (
              <button key={s} type="button" className={`chip${statusFilter === s ? " on" : ""}`} onClick={() => setStatusFilter(s)}>{s} ({statusCounts[s] || 0})</button>
            ))}
          </div>
          <div className="admin-orders">
            {filteredOrders.map((o) => {
              const isOpen = expanded === o.id;
              return (
                <div className="admin-order admin-order-col" key={o.id}>
                  <div className="admin-order-row">
                    <div className="ao-main">
                      <b>{o.id}</b> · {o.customer} ({o.email})
                      <span>{o.items.map((i) => `${i.name} × ${i.qty}${i.designId ? " [design]" : ""}`).join(" · ")}</span>
                      <span>{o.address.city} {o.address.pincode} · {inr(o.total)} · {o.paymentStatus} · {fmtDateTime(o.createdAt)}</span>
                    </div>
                    <div className="ao-status">
                      <button disabled={o.statusIdx === 0} onClick={() => advance(o, -1)}>←</button>
                      <span className="status-pill">{o.status}</span>
                      <button disabled={o.statusIdx >= STATUSES.length - 1} onClick={() => advance(o, 1)}>Advance →</button>
                      <button type="button" onClick={() => setExpanded(isOpen ? null : o.id)}>{isOpen ? "Hide" : "Details"}</button>
                      <Link href={`/account/orders/${o.id}`} className="ao-view">View</Link>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="ao-detail">
                      <p><b>Deliver to:</b> {o.address.name} · {o.address.phone}<br />{o.address.line}, {o.address.city}, {o.address.state} — {o.address.pincode}</p>
                      {o.giftNote && <p><b>Gift note:</b> “{o.giftNote}”{o.giftWrap ? " · gift wrap added" : ""}</p>}
                      {o.orderNote && <p><b>Customer note:</b> “{o.orderNote}”</p>}
                      {o.coupon && <p><b>Coupon:</b> {o.coupon.code} (−{o.coupon.pct}%, saved {inr(o.coupon.discount)})</p>}
                      <label className="ao-jump">Jump to stage{" "}
                        <select className="inp" value={o.statusIdx} onChange={(e) => setStatus(o, Number(e.target.value))} aria-label={`Set status for ${o.id}`}>
                          {STATUSES.map((s, i) => <option key={s} value={i}>{s}</option>)}
                        </select>
                      </label>
                      <div className="ao-items">
                        {o.items.map((i, x) => (
                          <div className="ao-item" key={x}>
                            <span>{i.name} × {i.qty} — {i.option}{i.customText ? ` · “${i.customText}”` : ""} · {inr(i.unit * i.qty)}</span>
                            {i.designId ? (
                              <span className="ao-design-actions">
                                <a className="design-dl" href={`/api/designs/${i.designId}/raw?download=1`}>Download print file{designs[i.designId]?.name ? ` (${designs[i.designId].name})` : ""}</a>
                                <a className="design-dl ghost" href={`/api/designs/${i.designId}/raw`} target="_blank" rel="noreferrer">Preview</a>
                              </span>
                            ) : <span className="muted">No custom design file</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {data && filteredOrders.length === 0 && <p className="lead" style={{ fontSize: 15 }}>{orders.length ? "No orders match that search / filter." : "No orders yet."}</p>}
            {!data && <p className="lead" style={{ fontSize: 15 }}>Loading orders…</p>}
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div className="panel">
          <h3>Customers</h3>
          <div className="admin-toolbar">
            <input className="inp" type="search" placeholder="Search name, email or phone…" value={custQuery} onChange={(e) => setCustQuery(e.target.value)} aria-label="Search customers" />
            <span className="muted">{filteredCustomers.length} customers</span>
          </div>
          <div className="cust-list">
            {filteredCustomers.map((c) => (
              <div className="cust-row" key={c.id}>
                <div className="ao-main">
                  <b>{c.name}</b> · {c.email}{c.phone ? ` · ${c.phone}` : ""}
                  <span>Joined {fmtDate(c.createdAt)} · {c.addressCount} saved address{c.addressCount === 1 ? "" : "es"} · {c.wishlistCount} wishlist item{c.wishlistCount === 1 ? "" : "s"}</span>
                  <span>{c.lastOrderAt ? `Last order ${fmtDateTime(c.lastOrderAt)}` : "No orders yet"}</span>
                </div>
                <div className="cust-nums">
                  <span><b>{c.orderCount}</b> orders</span>
                  <span><b>{inr(c.totalSpend)}</b> spent</span>
                  <button type="button" onClick={() => { setQuery(c.email); setStatusFilter("All"); setTab("orders"); }}>View orders</button>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && <p className="lead" style={{ fontSize: 15 }}>{customers.length ? "No customers match that search." : "No registered customers yet."}</p>}
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="panel">
          <h3>Products — prices &amp; stock (live instantly)</h3>
          <div className="admin-toolbar">
            <label className="check"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> Low stock only (≤ {LOW_STOCK_AT})</label>
            <span className="muted">{visibleProducts.length} products · {lowStockProducts.length} low</span>
          </div>
          <div className="admin-products">
            {visibleProducts.map((p) => {
              const low = typeof p.stock === "number" && p.stock <= LOW_STOCK_AT;
              const out = p.stock === 0;
              return (
                <div className={`admin-product${low ? " low" : ""}`} key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.name} />
                  <b>{p.name}{out ? " — SOLD OUT" : low ? ` — only ${p.stock} left` : ""}</b>
                  <label>Price ₹<input type="number" defaultValue={p.price} onBlur={(e) => editProduct(p, "price", e.target.value)} /></label>
                  <label>MRP ₹<input type="number" defaultValue={p.mrp} onBlur={(e) => editProduct(p, "mrp", e.target.value)} /></label>
                  <label>Stock<input type="number" defaultValue={p.stock} onBlur={(e) => editProduct(p, "stock", e.target.value)} /></label>
                  <button type="button" className="restock-btn" onClick={() => editProduct(p, "stock", (Number(p.stock) || 0) + 50)}>+50 restock</button>
                </div>
              );
            })}
            {visibleProducts.length === 0 && <p className="lead" style={{ fontSize: 15 }}>Nothing is low on stock right now.</p>}
          </div>
          <p className="note">Price changes save when you click away from the field. New prices apply to new orders immediately. Stock at 0 shows SOLD OUT in the shop and blocks checkout for that product.</p>
        </div>
      )}

      {tab === "coupons" && (
        <div className="panel">
          <h3>Coupons — validated on the server at checkout</h3>
          <div className="admin-products">
            {coupons.map((c) => (
              <div className="admin-product" key={c.code}>
                <b style={{ letterSpacing: 1 }}>{c.code}</b>
                <span className="muted">{c.pct}% off</span>
                <span className="status-pill" style={c.active ? {} : { opacity: 0.45 }}>{c.active ? "ACTIVE" : "OFF"}</span>
                <button type="button" className="restock-btn" onClick={() => toggleCoupon(c)}>{c.active ? "Disable" : "Enable"}</button>
              </div>
            ))}
            {!coupons.length && <p className="lead" style={{ fontSize: 15 }}>No coupons yet.</p>}
          </div>
          <div className="coupon-row" style={{ marginTop: 16, maxWidth: 460 }}>
            <input className="inp" placeholder="NEW CODE" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} />
            <input className="inp" type="number" min="1" max="90" style={{ width: 90 }} value={newCoupon.pct} onChange={(e) => setNewCoupon({ ...newCoupon, pct: e.target.value })} />
            <button type="button" className="btn" onClick={addCoupon}>Add</button>
          </div>
          <p className="note">Discount applies to the product subtotal; free-shipping threshold (₹699) is checked after the discount.</p>
        </div>
      )}
    </div>
  );
}
