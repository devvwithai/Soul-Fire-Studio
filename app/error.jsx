"use client";
import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="wrap page center">
      <div className="empty-ico">🔥</div>
      <h2 className="page-title">That page <span className="hl">fizzled</span></h2>
      <p className="lead" style={{ margin: "10px auto 24px" }}>Something glitched on our side — your cart and account are safe.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn big" onClick={() => reset()}>Try Again</button>
        <Link className="btn ghost big" href="/shop">Back to Shop</Link>
      </div>
    </div>
  );
}
