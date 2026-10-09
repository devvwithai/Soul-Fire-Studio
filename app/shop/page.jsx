"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";

const CATS = ["All", "Mugs", "Apparel", "Desk", "Gifts", "Bottles"];

function ShopInner() {
  const params = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  const [q, setQ] = useState(params.get("q") || "");
  useEffect(() => { fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])); }, []);

  const list = useMemo(() => {
    let l = products.filter((p) => (cat === "All" || p.cat === cat) && (p.name + p.tagline).toLowerCase().includes(q.toLowerCase()));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [products, cat, sort, q]);

  return (
    <div className="wrap page">
      <span className="kicker">Soulfire Collection</span>
      <h2 className="page-title">Shop <span className="hl">custom</span></h2>
      <p className="lead">Every piece starts blank. Every piece ends as a one-of-one — yours.</p>
      <div className="shop-bar">
        <div className="chips">
          {CATS.map((c) => <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="shop-tools">
          <input className="inp" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="inp" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>
        </div>
      </div>
      <div className="pgrid">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {!list.length && <p className="lead" style={{ marginTop: 30 }}>Nothing matches that — try another category.</p>}
    </div>
  );
}

export default function Shop() {
  return <Suspense fallback={<div className="wrap page"><p className="lead">Loading the collection…</p></div>}><ShopInner /></Suspense>;
}
