"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Flame, { FlameGradient } from "./Flame";
import { useStore } from "./StoreContext";
import { useState } from "react";

export default function Header() {
  const { user, cartCount, logout } = useStore();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const links = [["/shop", "Shop"], ["/track", "Track Order"], ["/#process", "Studio"], ["/#brand", "Brand"]];
  return (
    <>
      <div className="topbar">DEMO STORE — payments are in test mode (UPI via Cashfree coming soon) · Free shipping over ₹699</div>
      <header className="site-header">
        <Link className="brand" href="/">
          <FlameGradient id="hdrFlame" />
          <span>
            <span className="brand-name">SOUL<span className="fire">FIRE</span></span>
            <br /><span className="brand-sub">STUDIO</span>
          </span>
        </Link>
        <nav className="main-nav">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? "on" : ""}>{label}</Link>
          ))}
          {user?.role === "admin" && <Link href="/admin" className={path === "/admin" ? "on" : ""}>Admin</Link>}
        </nav>
        <div className="hdr-actions">
          <Link href="/account/wishlist" className="icon-btn" aria-label="Wishlist">♡{user?.wishlist?.length ? <span className="dot">{user.wishlist.length}</span> : null}</Link>
          <Link href="/cart" className="icon-btn" aria-label="Cart">🛒{cartCount ? <span className="dot">{cartCount}</span> : null}</Link>
          {user ? (
            <div className="user-menu">
              <button className="user-chip" onClick={() => setOpen(!open)}>
                <span className="avatar">{(user.name || "S").slice(0, 1).toUpperCase()}</span>
                <span className="uname">{user.name.split(" ")[0]}</span> ▾
              </button>
              {open && (
                <div className="dropdown" onClick={() => setOpen(false)}>
                  <Link href="/account">My Account</Link>
                  <Link href="/account/orders">My Orders</Link>
                  <Link href="/account/designs">My Designs</Link>
                  <Link href="/account/addresses">Addresses</Link>
                  <Link href="/account/settings">Settings</Link>
                  {user.role === "admin" && <Link href="/admin">Admin Panel</Link>}
                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn small">Login</Link>
          )}
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <Link className="brand" href="/">
            <FlameGradient id="ftrFlame" />
            <span><span className="brand-name">SOUL<span className="fire">FIRE</span></span><br /><span className="brand-sub">STUDIO</span></span>
          </Link>
          <p style={{ marginTop: 14 }}>Custom sublimation printing studio — mugs, t-shirts, mouse pads, keychains and bottles, made to order in Barasat, West Bengal and shipped across India.</p>
        </div>
        <div>
          <p><strong style={{ color: "var(--text)" }}>Shop</strong><br />
            <Link href="/shop">All Products</Link><br /><Link href="/cart">Cart</Link><br /><Link href="/track">Track Order</Link></p>
        </div>
        <div>
          <p><strong style={{ color: "var(--text)" }}>Account</strong><br />
            <Link href="/account">My Account</Link><br /><Link href="/account/orders">Orders</Link><br /><Link href="/account/designs">My Designs</Link><br /><Link href="/account/settings">Settings</Link></p>
        </div>
        <div>
          <p><strong style={{ color: "var(--text)" }}>Studio</strong><br />Barasat, West Bengal 743355<br />Dispatch: All India, tracked<br />Payments: UPI (demo mode)</p>
        </div>
        <p className="fine">© 2026 Soulfire Studio · Your design. Our fire. 🔥 · Prices include GST. Demo store — no real money moves yet.</p>
      </div>
    </footer>
  );
}

export { Flame };
