"use client";
import Link from "next/link";
import { useStore } from "../../components/StoreContext";
import { inr, FREE_SHIPPING } from "../../lib/pricing";

export default function Cart() {
  const { cart, updateQty, removeItem } = useStore();
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const toFree = Math.max(0, FREE_SHIPPING - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100));

  if (!cart.length)
    return (
      <div className="wrap page center">
        <div className="empty-ico">🛒</div>
        <h2 className="page-title">Your cart is <span className="hl">empty</span></h2>
        <p className="lead" style={{ margin: "10px auto 24px" }}>Blank canvases are waiting. Go set one on fire.</p>
        <Link className="btn big" href="/shop">Shop the Collection</Link>
      </div>
    );

  return (
    <div className="wrap page">
      <h2 className="page-title">Your <span className="hl">cart</span></h2>
      <div className="ship-progress">
        {toFree > 0 ? <p>Add <b>{inr(toFree)}</b> more for <b>FREE delivery</b></p> : <p>🎉 You unlocked <b>FREE delivery</b></p>}
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="cart-list">
        {cart.map((x, i) => (
          <div className="cart-row" key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.img} alt={x.name} />
            <div className="cart-info">
              <b>{x.name}</b>
              <span>{x.option}{x.customText ? ` · “${x.customText}”` : ""}{x.designName ? ` · Design: ${x.designName}` : ""}</span>
              <span className="cart-unit">{inr(x.price)} each</span>
            </div>
            <div className="qty-ctl">
              <button onClick={() => updateQty(i, x.qty - 1)}>−</button>
              <span>{x.qty}</span>
              <button onClick={() => updateQty(i, x.qty + 1)}>+</button>
            </div>
            <b className="cart-line">{inr(x.price * x.qty)}</b>
            <button className="rm" onClick={() => removeItem(i)} aria-label="Remove">✕</button>
          </div>
        ))}
      </div>
      <div className="cart-foot">
        <div>
          <span className="muted">Subtotal</span>
          <b className="price big">{inr(subtotal)}</b>
          <span className="muted">Delivery calculated at checkout by pincode</span>
        </div>
        <Link className="btn big" href="/checkout">Proceed to Checkout →</Link>
      </div>
    </div>
  );
}
