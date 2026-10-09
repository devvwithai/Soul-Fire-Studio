"use client";
import Link from "next/link";
import { inr } from "../lib/pricing";
import { useStore } from "./StoreContext";

export default function ProductCard({ p }) {
  const { user, toggleWish, say } = useStore();
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const wished = user?.wishlist?.includes(p.id);
  return (
    <article className="pcard">
      <Link href={`/product/${p.id}`} className="pcard-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.img} alt={p.name} loading="lazy" decoding="async" />
        {p.badge && <span className="pbadge">{p.badge}</span>}
        {off > 0 && <span className="poff">{off}% OFF</span>}
        {typeof p.stock === "number" && p.stock <= 0 && <span className="pstock out">SOLD OUT</span>}
        {typeof p.stock === "number" && p.stock > 0 && p.stock <= 10 && <span className="pstock">Only {p.stock} left</span>}
      </Link>
      <button
        className={`wish-btn ${wished ? "on" : ""}`}
        aria-label="Save to wishlist"
        onClick={async () => { const ok = await toggleWish(p.id); if (ok) say(wished ? "Removed from wishlist" : "Saved to wishlist ♡"); }}
      >{wished ? "♥" : "♡"}</button>
      <div className="pcard-body">
        <span className="pcat">{p.cat}</span>
        <Link href={`/product/${p.id}`}><h3>{p.name}</h3></Link>
        <p className="ptag">{p.tagline}</p>
        <div className="prow">
          <span className="price">{inr(p.price)}</span>
          {p.mrp > p.price && <span className="mrp">{inr(p.mrp)}</span>}
          <Link className="customise-link" href={`/product/${p.id}`}>Customise →</Link>
        </div>
      </div>
    </article>
  );
}
