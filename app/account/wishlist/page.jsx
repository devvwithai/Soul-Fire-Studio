"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../../../components/ProductCard";
import { useStore } from "../../../components/StoreContext";

export default function Wishlist() {
  const { user } = useStore();
  const [products, setProducts] = useState([]);
  useEffect(() => { fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])); }, []);
  const list = products.filter((p) => user?.wishlist?.includes(p.id));
  return (
    <>
      <h2 className="acct-title">My <span className="hl">wishlist</span></h2>
      {!list.length && <p className="lead">Nothing saved yet. Tap the ♡ on any product to keep it here. <Link href="/shop" style={{ color: "var(--sky)" }}>Browse →</Link></p>}
      <div className="pgrid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </>
  );
}
