"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { inr, deliveryEstimate } from "../../../../lib/pricing";
import { Timeline } from "../../../order-success/[id]/page";
import { useStore } from "../../../../components/StoreContext";

export default function OrderDetail() {
  const { id } = useParams();
  const { addToCart } = useStore();
  const [o, setO] = useState(null);
  useEffect(() => { fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => setO(d.order || null)); }, [id]);
  if (!o) return <p className="lead">Loading order…</p>;
  const reorder = () => {
    o.items.forEach((i) => addToCart({ productId: i.productId, name: i.name, img: i.img, price: i.unit, qty: i.qty, option: i.option, customText: i.customText, designId: i.designId }));
  };
  return (
    <>
      <p className="crumbs"><Link href="/account/orders">My Orders</Link> / {o.id}</p>
      <h2 className="acct-title">Order <span className="hl">{o.id}</span></h2>
      <div className="order-grid">
        <div className="panel">
          <h3>Live status</h3>
          <Timeline order={o} />
          <p className="note" style={{ marginTop: 14 }}>Estimated delivery: <b style={{ color: "var(--sky-soft)" }}>{deliveryEstimate(o.address.pincode)}</b> to {o.address.pincode}</p>
        </div>
        <div>
          <div className="panel">
            <h3>Items</h3>
            {o.items.map((i, x) => (
              <div className="sum-row" key={x}>
                <span>{i.name} × {i.qty}<br /><small className="muted">{i.option}{i.customText ? ` · “${i.customText}”` : ""}{i.designId ? " · custom design attached" : ""}</small></span>
                <b>{inr(i.unit * i.qty)}</b>
              </div>
            ))}
            <div className="sum-row"><span>Delivery</span><b>{o.delivery === 0 ? "FREE" : inr(o.delivery)}</b></div>
            {o.wrapFee > 0 && <div className="sum-row"><span>Gift wrap</span><b>{inr(o.wrapFee)}</b></div>}
            <div className="sum-row total"><span>Total · {o.paymentStatus}</span><b>{inr(o.total)}</b></div>
            <button className="btn full" style={{ marginTop: 14 }} onClick={reorder}>Buy Again →</button>
          </div>
          <div className="panel" style={{ marginTop: 16 }}>
            <h3>Delivery address</h3>
            <p className="lead" style={{ fontSize: 14.5 }}>{o.address.name} · {o.address.phone}<br />{o.address.line}, {o.address.city}, {o.address.state} — {o.address.pincode}</p>
            {o.giftNote && <p className="note">🎁 Gift note: “{o.giftNote}”</p>}
          </div>
        </div>
      </div>
    </>
  );
}
