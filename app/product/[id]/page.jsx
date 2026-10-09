"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { inr, deliveryEstimate } from "../../../lib/pricing";
import { useStore } from "../../../components/StoreContext";
import ProductCard from "../../../components/ProductCard";

const Viewer3D = dynamic(() => import("../../../components/Viewer3D"), { ssr: false });
const SHAPES = { mug: "mug", bottle: "bottle", "pad-large": "pad", "pad-small": "pad", keychain: "disc", tee: "cloth" };

export default function PDP() {
  const { id } = useParams();
  const router = useRouter();
  const { user, addToCart, say } = useStore();
  const [p, setP] = useState(undefined); // undefined = loading, null = not found
  const [option, setOption] = useState("");
  const [qty, setQty] = useState(1);
  const [text, setText] = useState("");
  const [design, setDesign] = useState(null); // {id, url(local preview), name}
  const [quality, setQuality] = useState(null);
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState("photo"); // photo | 3d | video
  const [myDesigns, setMyDesigns] = useState([]);
  const [designScale, setDesignScale] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => {
      const found = (d.products || []).find((x) => x.id === id);
      setP(found || null);
      setAllProducts(d.products || []);
      if (found) setOption(found.options?.values?.[0] || "");
    });
  }, [id]);

  useEffect(() => {
    if (user) fetch("/api/designs").then((r) => r.json()).then((d) => setMyDesigns(d.designs || [])).catch(() => {});
  }, [user]);

  const unit = useMemo(() => {
    if (!p) return 0;
    return p.id === "keychain" && option.startsWith("Double") ? p.price + 50 : p.price;
  }, [p, option]);

  if (p === undefined) return <div className="wrap page"><p className="lead">Loading…</p></div>;
  if (!p) return <div className="wrap page"><h2 className="page-title">Product not found</h2><p className="lead" style={{ margin: "10px 0 22px" }}>That product doesn't exist or is no longer available.</p><Link className="btn" href="/shop">Back to Shop</Link></div>;
  const soldOut = typeof p.stock === "number" && p.stock <= 0;
  const lowStock = !soldOut && typeof p.stock === "number" && p.stock <= 10;

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const mp = (img.naturalWidth * img.naturalHeight) / 1e6;
      setQuality(mp >= 2 ? { t: "Print-sharp ✓", cls: "good", d: `${img.naturalWidth}×${img.naturalHeight}px — perfect for a crisp print.` }
        : mp >= 0.7 ? { t: "Good enough", cls: "ok", d: `${img.naturalWidth}×${img.naturalHeight}px — will print well at this size.` }
        : { t: "Too small ⚠", cls: "bad", d: `${img.naturalWidth}×${img.naturalHeight}px — may look soft. A bigger photo will print much better.` });
    };
    img.src = url;
    if (user === null) {
      const guest = { id: null, url, name: file.name, pendingFile: file };
      // Keep a data-URL copy (≤2.5MB) so the design survives login and is
      // uploaded for real at checkout — bigger files ask for login first.
      if (file.size <= 2.5 * 1024 * 1024) {
        const rd = new FileReader();
        rd.onload = () => setDesign((d) => (d && d.name === file.name ? { ...d, dataUrl: rd.result } : d));
        rd.readAsDataURL(file);
        say("Preview ready — your design rides along to checkout");
      } else {
        say("Preview ready — login first so we can save designs over 2.5MB");
      }
      setDesign(guest);
      setMode("3d"); // jump straight into the 360° view with their art on the product
      return;
    }
    // user is an object, or still undefined (auth loading) — try the real
    // upload; a 401 means guest, so fall back to the ride-along path.
    setDesign({ id: null, url, name: file.name, pendingFile: file });
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    setUploading(false);
    if (d.design) { setDesign({ id: d.design.id, url: `/api/designs/${d.design.id}/raw`, name: d.design.name }); setMode("3d"); }
    else if (r.status === 401) { setMode("3d");
      if (file.size <= 2.5 * 1024 * 1024) {
        const rd = new FileReader();
        rd.onload = () => setDesign((dd) => (dd && dd.name === file.name ? { ...dd, dataUrl: rd.result } : dd));
        rd.readAsDataURL(file);
        say("Preview ready — login at checkout to save the design");
      } else say("Preview ready — login first so we can save designs over 2.5MB");
    } else { setMode("3d"); say(d.error || "Upload failed, preview only"); }
  };

  const item = () => ({ productId: p.id, name: p.name, img: p.img, price: unit, qty, option, customText: text, designId: design?.id || null, designName: design?.name || "", designDataUrl: design?.id ? null : design?.dataUrl || null });

  return (
    <div className="wrap page">
      <p className="crumbs"><Link href="/shop">Shop</Link> / {p.cat} / {p.name}</p>
      <div className="pdp">
        <div className="pdp-left">
          <div className="mode-tabs" role="tablist">
            <button className={mode === "photo" ? "on" : ""} onClick={() => setMode("photo")}>📷 Photo</button>
            <button className={mode === "3d" ? "on" : ""} onClick={() => setMode("3d")}>🧊 3D · 360°</button>
            <button className={mode === "video" ? "on" : ""} onClick={() => setMode("video")}>🎬 Video Spin</button>
          </div>
          {mode === "photo" ? (
            <div className="mock">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.name} />
              {design && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="mock-design" src={design.url} alt="Your design preview"
                  style={{ left: `${p.print.x + (p.print.w - p.print.w * designScale) / 2}%`, top: `${p.print.y + (p.print.h - p.print.h * designScale) / 2}%`, width: `${p.print.w * designScale}%`, height: `${p.print.h * designScale}%`, borderRadius: p.print.radius }} />
              )}
              {text && !design && <div className="mock-text" style={{ left: `${p.print.x}%`, top: `${p.print.y + p.print.h / 2 - 6}%`, width: `${p.print.w}%` }}>{text}</div>}
              <span className="mock-cap">{design || text ? "LIVE PREVIEW — your design" : "Studio design shown — upload yours"}</span>
            </div>
          ) : (
            <Viewer3D
              key={`${p.id}-${mode}`}
              shape={SHAPES[p.id] || "mug"}
              designSrc={design?.url || null}
              text={text}
              productName={p.name}
              printZone={p.print}
              basePhoto={p.img}
              autoSpin={mode === "video"}
            />
          )}
          <div className="pdp-points">
            <span>✓ Free proof before printing</span><span>✓ No fade · No crack · No peel</span><span>✓ Made in Barasat, WB</span>
          </div>
        </div>

        <div className="pdp-right">
          {p.badge && <span className="pbadge static">{p.badge}</span>}
          <h1 className="pdp-title">{p.name}</h1>
          <p className="ptag big">{p.tagline}</p>
          <div className="price-row">
            <span className="price big">{inr(unit)}</span>
            {p.mrp > unit && <><span className="mrp">{inr(p.mrp)}</span><span className="save">Save {inr(p.mrp - unit)}</span></>}
          </div>
          <p className="pdesc">{p.desc}</p>

          <label className="fld-label">{p.options?.label}</label>
          <div className="chips">
            {p.options?.values.map((v) => <button key={v} className={`chip ${option === v ? "on" : ""}`} onClick={() => setOption(v)}>{v}</button>)}
          </div>

          <label className="fld-label">Your design</label>
          <div className="upload-box" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
            <div className="upload-ico">⬆</div>
            <div>
              <b>{uploading ? "Uploading…" : design ? design.name : "Upload photo / artwork"}</b>
              <span>{design ? "Tap to replace" : "PNG or JPG · saved to My Designs when logged in"}</span>
            </div>
          </div>
          {quality && <div className={`quality ${quality.cls}`}><b>{quality.t}</b> — {quality.d}</div>}
          {myDesigns.length > 0 && (
            <>
              <label className="fld-label">Or pick from My Designs</label>
              <div className="design-strip">
                {myDesigns.map((d) => (
                  <button key={d.id} type="button" className={design?.id === d.id ? "on" : ""} title={d.name}
                    onClick={() => { setDesign({ id: d.id, url: `/api/designs/${d.id}/raw`, name: d.name }); setMode("3d"); say("Design applied — 360° view"); }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/designs/${d.id}/raw`} alt={d.name} />
                  </button>
                ))}
              </div>
            </>
          )}
          {design && mode === "photo" && (
            <div className="vscale" style={{ marginTop: 14 }}>
              <span>Design size</span>
              <input type="range" min="0.55" max="1.25" step="0.05" value={designScale} onChange={(e) => setDesignScale(+e.target.value)} style={{ flex: 1 }} />
              <span>{Math.round(designScale * 100)}%</span>
            </div>
          )}

          <label className="fld-label">Add a name / text (optional)</label>
          <input className="inp full" maxLength={28} placeholder="e.g. Happy Birthday Aarav" value={text} onChange={(e) => setText(e.target.value)} />

          <div className="qty-row" style={{ marginTop: 18 }}>
            <label className="fld-label" style={{ margin: 0 }}>Quantity</label>
            <input type="range" min="1" max="100" value={qty} onChange={(e) => setQty(+e.target.value)} />
            <span className="qty-num">{qty}<small>{qty === 1 ? "PIECE" : "PIECES"}</small></span>
          </div>

          <div className="pin-box">
            <input className="inp" placeholder="Delivery pincode" maxLength={6} inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
            {pin.length === 6
              ? <span className="pin-ok">🚚 Delivery by <b>{deliveryEstimate(pin)}</b> · {unit * qty >= 699 ? "FREE delivery 🎉" : "delivery calculated at checkout"}</span>
              : <span className="pin-hint">Enter pincode for a delivery date</span>}
          </div>

          {soldOut
            ? <p className="quality bad" style={{ marginBottom: 14 }}><b>Sold out right now</b> — this blank is being restocked. Check back soon or pick another canvas.</p>
            : lowStock && <p className="quality ok" style={{ marginBottom: 14 }}><b>Only {p.stock} left in stock</b> — made-to-order pieces move fast.</p>}
          <div className="pdp-cta">
            <button className="btn big ghost" disabled={soldOut} onClick={() => addToCart(item())}>{soldOut ? "Sold Out" : "Add to Cart"}</button>
            <button className="btn big" disabled={soldOut} onClick={() => { addToCart(item()); router.push("/cart"); }}>Buy Now →</button>
          </div>
          <p className="note">Total for {qty}: <b style={{ color: "var(--sky-soft)" }}>{inr(unit * qty)}</b> · Bulk order (25+)? Prices drop automatically in your quote — mention it in the order note at checkout.</p>
        </div>
      </div>

      {allProducts.filter((x) => x.id !== p.id).length > 0 && (
        <section style={{ marginTop: 56 }}>
          <div className="sec-head">
            <div>
              <span className="kicker">One design · whole setup</span>
              <h2>Your design also <span className="hl">slaps</span> on these</h2>
            </div>
            <Link className="btn ghost" href="/shop">All products →</Link>
          </div>
          <div className="pgrid">
            {[...allProducts.filter((x) => x.id !== p.id && x.cat === p.cat), ...allProducts.filter((x) => x.id !== p.id && x.cat !== p.cat)].slice(0, 3).map((x) => <ProductCard key={x.id} p={x} />)}
          </div>
        </section>
      )}
    </div>
  );
}
