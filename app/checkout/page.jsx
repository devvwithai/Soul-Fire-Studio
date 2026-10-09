"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "../../components/StoreContext";
import { inr, deliveryCharge, deliveryEstimate, FREE_SHIPPING } from "../../lib/pricing";

const HEAVY = new Set(["mug", "bottle"]);

export default function Checkout() {
  const { user, cart, clearCart, refreshUser, say } = useStore();
  const router = useRouter();
  const [addrId, setAddrId] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [paying, setPaying] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", pincode: "", line: "", city: "", state: "", landmark: "" });

  useEffect(() => {
    if (user === null) router.push("/login?next=/checkout");
    if (user?.addresses?.length) setAddrId((user.addresses.find((a) => a.isDefault) || user.addresses[0]).id);
  }, [user, router]);

  const addr = user?.addresses?.find((a) => a.id === addrId);
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const hasHeavy = cart.some((x) => HEAVY.has(x.productId));
  const delivery = addr ? deliveryCharge(addr.pincode, hasHeavy, subtotal) : 0;
  const total = subtotal + delivery + (giftWrap ? 49 : 0);

  const addAddress = async (e) => {
    e.preventDefault();
    const r = await fetch("/api/me/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.user) { await refreshUser(); say("Address saved"); }
    else setErr(d.error || "Could not save address");
  };

  const placeOrder = async () => {
    setPlacing(true); setErr("");
    const r = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, addressId: addrId, giftWrap, giftNote }),
    });
    const d = await r.json();
    setPlacing(false);
    if (d.order) { clearCart(); router.push(`/order-success/${d.order.id}`); }
    else { setPaying(false); setErr(d.error || "Could not place the order"); }
  };

  if (user === undefined) return <div className="wrap page"><p className="lead">Loading…</p></div>;
  if (!cart.length) return <div className="wrap page center"><h2 className="page-title">Cart is empty</h2><Link className="btn" href="/shop" style={{ marginTop: 16 }}>Go Shopping</Link></div>;

  return (
    <div className="wrap page">
      <h2 className="page-title">Check<span className="hl">out</span></h2>
      <div className="checkout-grid">
        <div>
          <div className="panel">
            <h3>Delivery address</h3>
            {user?.addresses?.length > 0 ? (
              <div className="addr-list">
                {user.addresses.map((a) => (
                  <label key={a.id} className={`addr-card ${addrId === a.id ? "on" : ""}`}>
                    <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                    <span><b>{a.name}</b> · {a.phone}<br />{a.line}, {a.city}, {a.state} — <b>{a.pincode}</b>{a.isDefault ? " · Default" : ""}</span>
                  </label>
                ))}
                {addr && <p className="pin-ok" style={{ marginTop: 10 }}>🚚 Delivery by <b>{deliveryEstimate(addr.pincode)}</b></p>}
              </div>
            ) : (
              <form className="addr-form" onSubmit={addAddress}>
                <input className="inp" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="inp" required placeholder="Phone (10-digit)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="inp" required placeholder="Pincode" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} />
                <input className="inp" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className="inp full" required placeholder="Address — house no, street, area" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
                <input className="inp" required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <input className="inp" placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
                <button className="btn" type="submit">Save Address</button>
              </form>
            )}
            <p className="note"><Link href="/account/addresses" style={{ color: "var(--sky)" }}>Manage addresses →</Link></p>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <h3>Make it a gift</h3>
            <label className="check"><input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} /> Gift wrap (+₹49) — prices hidden inside</label>
            <input className="inp full" style={{ marginTop: 12 }} placeholder="Gift note (optional) — we handwrite it" value={giftNote} onChange={(e) => setGiftNote(e.target.value)} />
          </div>
        </div>

        <div className="panel summary-panel">
          <h3>Order summary</h3>
          {cart.map((x, i) => (
            <div className="sum-row" key={i}><span>{x.name} × {x.qty}</span><b>{inr(x.price * x.qty)}</b></div>
          ))}
          <div className="sum-row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
          <div className="sum-row"><span>Delivery</span><b>{delivery === 0 ? "FREE 🎉" : inr(delivery)}</b></div>
          {giftWrap && <div className="sum-row"><span>Gift wrap</span><b>{inr(49)}</b></div>}
          <div className="sum-row total"><span>Total</span><b>{inr(total)}</b></div>
          {err && <p className="err">{err}</p>}
          <button className="btn big full" disabled={!addr} onClick={() => setPaying(true)}>
            {addr ? `Pay ${inr(total)} with UPI` : "Add an address to pay"}
          </button>
          <p className="note center">🧪 Demo payment — Cashfree UPI goes live soon. No real money moves.</p>
          <div className="trust-row"><span>🔒 Secure</span><span>✓ Free proof</span><span>🚚 Tracked delivery</span></div>
        </div>
      </div>

      {paying && (
        <div className="modal-bg">
          <div className="modal">
            <span className="kicker">Demo UPI Payment</span>
            <h3>Pay {inr(total)}</h3>
            <div className="fake-qr" aria-hidden="true">{Array.from({ length: 81 }).map((_, i) => <span key={i} className={(i * 7 + 3) % 3 === 0 ? "on" : ""} />)}</div>
            <p className="note center">Scan with any UPI app — in demo mode, just tap below.<br />UPI ID: <b>soulfirestudio@upi</b> (demo)</p>
            <button className="btn big full" disabled={placing} onClick={placeOrder}>{placing ? "Placing your order…" : "✓ I Have Paid (Demo)"}</button>
            <button className="btn ghost full" style={{ marginTop: 10 }} onClick={() => setPaying(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
