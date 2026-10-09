"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { inr } from "../../../lib/pricing";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || [])); }, []);
  if (orders === null) return <p className="lead">Loading orders…</p>;
  return (
    <>
      <h2 className="acct-title">My <span className="hl">orders</span></h2>
      {!orders.length && <p className="lead">No orders yet. <Link href="/shop" style={{ color: "var(--sky)" }}>Shop →</Link></p>}
      <div className="order-list">
        {orders.map((o) => (
          <Link key={o.id} href={`/account/orders/${o.id}`} className="order-card">
            <div className="order-imgs">{o.items.slice(0, 3).map((i, x) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={x} src={i.img} alt={i.name} />
            ))}</div>
            <div className="order-info">
              <b>{o.id}</b>
              <span>{o.items.map((i) => `${i.name} × ${i.qty}`).join(" · ")}</span>
              <span>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {inr(o.total)}</span>
            </div>
            <span className="status-pill">{o.status}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
