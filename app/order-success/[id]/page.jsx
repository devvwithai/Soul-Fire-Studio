"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { inr } from "../../../lib/pricing";

const STEPS = ["Placed", "Design Proof", "Printing", "Quality Check", "Packed", "Dispatched", "Out for Delivery", "Delivered"];
export function Timeline({ order }) {
  return (
    <div className="timeline">
      {STEPS.map((s, i) => {
        const hit = order.timeline?.find((t) => t.status === s);
        const done = i <= order.statusIdx;
        return (
          <div key={s} className={`tstep ${done ? "done" : ""} ${i === order.statusIdx ? "now" : ""}`}>
            <span className="tdot">{done ? "✓" : i + 1}</span>
            <div><b>{s}</b>{hit && <span>{new Date(hit.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Success() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => setOrder(d.order || null)); }, [id]);
  return (
    <div className="wrap page">
      <div className="success-card">
        <div className="success-ico">🔥</div>
        <h2 className="page-title">Order <span className="hl">placed!</span></h2>
        <p className="lead" style={{ margin: "8px auto 4px" }}>Order ID <b style={{ color: "var(--sky-soft)" }}>{id}</b> · {order ? `${inr(order.total)} · ${order.paymentStatus}` : ""}</p>
        <p className="lead" style={{ margin: "0 auto 22px" }}>Next: we prepare your free design proof. Printing starts only after you approve it.</p>
        {order && <Timeline order={order} />}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Link className="btn big" href="/account/orders">Track in My Account</Link>
          <Link className="btn ghost big" href="/shop">Keep Shopping</Link>
        </div>
      </div>
    </div>
  );
}
