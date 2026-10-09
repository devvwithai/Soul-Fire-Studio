"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useStore } from "../../components/StoreContext";
import { inr, FREE_SHIPPING } from "../../lib/pricing";

// Server-side unit price for a cart line, mirroring POST /api/orders exactly:
// the live product price, plus ₹50 for a double-sided keychain.
function serverUnit(product, line) {
  let unit = product.price;
  if (product.id === "keychain" && String(line.option || "").startsWith("Double")) unit += 50;
  return unit;
}

export default function Cart() {
  const { cart, setCart, updateQty, removeItem, say } = useStore();
  const sayRef = useRef(say);
  sayRef.current = say;
  const refreshedRef = useRef(false);

  // Refresh line prices from the server once the saved cart has loaded, so
  // totals here match what checkout will actually charge. Lines whose
  // product is no longer sold are left untouched (checkout validates them).
  useEffect(() => {
    if (refreshedRef.current || !cart.length) return;
    refreshedRef.current = true;
    (async () => {
      try {
        const r = await fetch("/api/products", { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        const products = Array.isArray(d?.products) ? d.products : [];
        if (!products.length) return;
        const byId = new Map(products.map((p) => [p.id, p]));
        const changed = cart.some((x) => {
          const p = byId.get(x.productId);
          return p && typeof p.price === "number" && Number.isFinite(p.price) && serverUnit(p, x) !== x.price;
        });
        if (!changed) return;
        setCart((c) =>
          c.map((x) => {
            const p = byId.get(x.productId);
            if (!p || typeof p.price !== "number" || !Number.isFinite(p.price)) return x;
            const unit = serverUnit(p, x);
            return unit === x.price ? x : { ...x, price: unit };
          })
        );
        sayRef.current("Cart prices updated to match the store");
      } catch {}
    })();
  }, [cart, setCart]);
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
          <span className="muted">Prices are refreshed from the store and confirmed at checkout — the checkout total is the final price you pay.</span>
        </div>
        <Link className="btn big" href="/checkout">Proceed to Checkout →</Link>
      </div>
    </div>
  );
}
