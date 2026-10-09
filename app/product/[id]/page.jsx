"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { inr, deliveryEstimate } from "../../../lib/pricing";
import { useStore } from "../../../components/StoreContext";

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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => {
      const found = (d.products || []).find((x) => x.id === id);
      setP(found || null);
      if (found) setOption(found.options?.values?.[0] || "");
    });
  }, [id]);

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
    if (!user) { setDesign({ id: null, url, name: file.name, pendingFile: file }); say("Preview ready — login at checkout to save the design"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setUploading(false);
    if (d.design) setDesign({ id: d.design.id, url: `/api/designs/${d.design.id}/raw`, name: d.design.name });
    else { setDesign({ id: null, url, name: file.name }); say(d.error || "Upload failed, preview only"); }
  };

  const item = () => ({ productId: p.id, name: p.name, img: p.img, price: unit, qty, option, customText: text, designId: design?.id || null, designName: design?.name || "" });

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
                  style={{ left: `${p.print.x}%`, top: `${p.print.y}%`, width: `${p.print.w}%`, height: `${p.print.h}%`, borderRadius: p.print.radius }} />
              )}
              {text && !design && <div className="mock-text" style={{ left: `${p.print.x}%`, top: `${p.print.y + p.print.h / 2 - 6}%`, width: `${p.print.w}%` }}>{text}</div>}
              <span className="mock-cap">{design || text ? "LIVE PREVIEW — your design" : "Studio design shown — upload yours"}</span>
            </div>
          ) : (
            <Viewer3D
              key={mode}
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
    </div>
  );
}
