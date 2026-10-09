"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "../../components/StoreContext";
import { inr } from "../../lib/pricing";

export default function Overview() {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [designs, setDesigns] = useState([]);
  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
    fetch("/api/designs").then((r) => r.json()).then((d) => setDesigns(d.designs || []));
  }, []);
  const last = orders[0];
  return (
    <>
      <h2 className="acct-title">Namaste, <span className="hl">{user.name.split(" ")[0]}</span> 👋</h2>
      <div className="acct-stats">
        <div className="stat"><b>{orders.length}</b><span>orders placed</span></div>
        <div className="stat"><b>{designs.length}</b><span>designs saved</span></div>
        <div className="stat"><b>{user.wishlist?.length || 0}</b><span>wishlist items</span></div>
        <div className="stat"><b>{user.addresses?.length || 0}</b><span>saved addresses</span></div>
      </div>
      {last ? (
        <div className="panel" style={{ marginTop: 18 }}>
          <h3>Latest order · {last.id}</h3>
          <p className="lead" style={{ fontSize: 15 }}>{last.items.map((i) => `${i.name} × ${i.qty}`).join(" · ")} — <b style={{ color: "var(--sky-soft)" }}>{last.status}</b> · {inr(last.total)}</p>
          <Link className="btn" href={`/account/orders/${last.id}`} style={{ marginTop: 14 }}>Track Order →</Link>
        </div>
      ) : (
        <div className="panel" style={{ marginTop: 18 }}>
          <h3>No orders yet</h3>
          <p className="lead" style={{ fontSize: 15 }}>Your first custom piece is waiting to be designed.</p>
          <Link className="btn" href="/shop" style={{ marginTop: 14 }}>Start Shopping →</Link>
        </div>
      )}
    </>
  );
}
