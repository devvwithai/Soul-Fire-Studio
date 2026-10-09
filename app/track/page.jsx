"use client";
import { useState } from "react";
import { inr } from "../../lib/pricing";
import { Timeline } from "../order-success/[id]/page";

export default function Track() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(""); setOrder(null);
    const r = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, email }) });
    const d = await r.json();
    setBusy(false);
    if (d.order) setOrder(d.order); else setErr(d.error || "Not found");
  };

  return (
    <div className="wrap page">
      <div className="auth-card wide">
        <span className="kicker">Order Tracking</span>
        <h2>Where's my <span className="hl">fire?</span></h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <input className="inp full" required placeholder="Order ID (e.g. SF1001)" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <input className="inp full" type="email" required placeholder="Email used for the order" value={email} onChange={(e) => setEmail(e.target.value)} />
          {err && <p className="err">{err}</p>}
          <button className="btn big full" disabled={busy}>{busy ? "Searching…" : "Track Order"}</button>
        </form>
        {order && (
          <div style={{ marginTop: 24 }}>
            <p className="lead" style={{ fontSize: 15 }}>Order <b style={{ color: "var(--sky-soft)" }}>{order.id}</b> · Total {inr(order.total)} · {order.paymentStatus}</p>
            <p className="note">{order.items.map((i) => `${i.name} × ${i.qty}`).join(" · ")}</p>
            <Timeline order={order} />
          </div>
        )}
      </div>
    </div>
  );
}
