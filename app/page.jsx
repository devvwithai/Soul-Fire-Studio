"use client";

import { useEffect, useMemo, useState } from "react";
import Flame, { FlameGradient } from "../components/Flame";

const PRODUCTS = [
  { id: "mug", name: "Custom Mugs", glyph: "☕", grad: "linear-gradient(135deg,#0b2a44,#0796f5)", blurb: "11oz ceramic mugs printed edge-to-edge with your photo, artwork or logo. The classic gift that never misses.", tags: ["11oz ceramic", "Photo print", "Gift ready"] },
  { id: "tee", name: "Custom T-Shirts", glyph: "👕", grad: "linear-gradient(135deg,#071a30,#12b5ff)", blurb: "Soft sublimation tees with rich, permanent colour. Perfect for squads, events, birthdays and brand merch.", tags: ["Vibrant print", "Team orders", "Event merch"] },
  { id: "pad-large", name: "Large Desk Mouse Pads", glyph: "🖱️", grad: "linear-gradient(135deg,#0a1c33,#0057d9)", blurb: "Big desk coverage with a smooth gaming surface and anti-slip base. Turn your setup into a statement.", tags: ["Desk size", "Gaming surface", "Anti-slip base"] },
  { id: "pad-small", name: "Classic Mouse Pads", glyph: "🖱️", grad: "linear-gradient(135deg,#06263f,#38c8ff)", blurb: "The everyday essential, personalised. Crisp prints that survive daily clicks, coffee spills and chaos.", tags: ["Everyday size", "Crisp detail", "Easy clean"] },
  { id: "keychain", name: "MDF Keychains", glyph: "🔑", grad: "linear-gradient(135deg,#0d2f52,#0796f5)", blurb: "Small, tough and full of personality. Photos, names, anime art, couple prints — pocket-sized Soulfire.", tags: ["Double-sided", "Lightweight", "Bulk friendly"] },
  { id: "bottle", name: "Sipper Bottles", glyph: "🍶", grad: "linear-gradient(135deg,#081f38,#12b5ff)", blurb: "750ml aluminium bottles with your name or design fused in. Gym, school, office — unmistakably yours.", tags: ["750ml aluminium", "Name print", "Scratch resistant"] },
];

const STEPS = [
  ["Order In", "Your brief lands with us — product, design and quantity locked in."],
  ["Design", "We prep your artwork for print: sizing, colours and placement perfected."],
  ["Print", "High-resolution sublimation printing for deep, rich colour."],
  ["Heat Press", "Heat and pressure fuse the design permanently into the surface."],
  ["Quality Check", "Every piece is inspected — colour, alignment and finish."],
  ["Pack", "Wrapped safe for the road, gift-ready if you asked for it."],
  ["Ship", "Dispatched from Barasat, West Bengal with tracked delivery."],
  ["Delivered", "Your design, in your hands. Tag us when it lands."],
];

const STYLES = ["Photo Print", "Name / Text", "Photo + Text", "Logo Print"];

export default function Home() {
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [qty, setQty] = useState(1);
  const [style, setStyle] = useState(STYLES[0]);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const summary = useMemo(() => {
    const extras = [
      giftWrap ? "• Gift wrap: Yes" : null,
      giftNote ? "• Handwritten gift note: Yes" : null,
      urgent ? "• Priority dispatch requested" : null,
    ].filter(Boolean);
    return [
      "🔥 SOULFIRE STUDIO — ORDER BRIEF",
      "--------------------------------",
      `Product: ${product.name}`,
      `Quantity: ${qty}`,
      `Print style: ${style}`,
      ...(extras.length ? extras : ["• Extras: None"]),
      "",
      "Design: (attach your photo / artwork)",
      "Delivery pincode: ",
    ].join("\n");
  }, [product, qty, style, giftWrap, giftNote, urgent]);

  const copyBrief = async () => {
    try { await navigator.clipboard.writeText(summary); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pick = (p) => {
    setProduct(p);
    document.getElementById("customise")?.scrollIntoView({ behavior: "smooth" });
  };

  const marquee = ["CUSTOM MUGS", "T-SHIRTS", "MOUSE PADS", "KEYCHAINS", "BOTTLES", "PHOTO GIFTS", "BULK ORDERS", "SHIPS ACROSS INDIA"];

  return (
    <>
      <div className="bg-grid" />
      <header className="nav">
        <a className="brand" href="#top">
          <FlameGradient id="navFlame" />
          <span>
            <span className="brand-name">SOUL<span className="fire">FIRE</span></span>
            <br /><span className="brand-sub">STUDIO</span>
          </span>
        </a>
        <nav className="nav-links">
          <a href="#products">Products</a>
          <a href="#customise">Customise</a>
          <a href="#process">Process</a>
          <a href="#brand">Brand</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="btn small" href="#customise">Start an Order</a>
      </header>

      <main id="top">
        {/* HERO */}
        <div className="wrap hero">
          <div className="hero-grid">
            <div>
              <span className="kicker">Custom Sublimation Printing Studio</span>
              <h1>Your design.<br />Our <span className="hl">fire.</span></h1>
              <p>Soulfire Studio turns your photos, art and ideas into premium printed mugs, tees, mouse pads, keychains and bottles — made to order in Barasat, West Bengal and shipped across India.</p>
              <div className="hero-cta">
                <a className="btn" href="#customise">🔥 Build My Order</a>
                <a className="btn ghost" href="#products">See Products</a>
              </div>
              <div className="badges">
                <span className="badge">No crack · No peel · No fade</span>
                <span className="badge">Made to order</span>
                <span className="badge">Pan-India delivery</span>
              </div>
            </div>
            <div className="lockup-card">
              <FlameGradient id="heroFlame" className="hero-flame" />
              <div className="lockup-word">SOUL<span className="fire" style={{ color: "var(--sky)" }}>FIRE</span></div>
              <div className="lockup-sub">STUDIO</div>
              <div className="mini-row">
                <span className="mini" style={{ background: "#05080d" }}><Flame fill="#ffffff" /></span>
                <span className="mini" style={{ background: "linear-gradient(135deg,#38c8ff,#0796f5)" }}><Flame fill="#04070c" /></span>
                <span className="mini" style={{ background: "#f4f9ff" }}><Flame fill="#04070c" /></span>
                <span className="mini circle" style={{ background: "#0a0f16" }}><Flame fill="#12b5ff" /></span>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat"><b>6</b><span>product lines — mugs, tees, pads, keychains & bottles</span></div>
            <div className="stat"><b>8-step</b><span>in-house process from design to doorstep</span></div>
            <div className="stat"><b>100%</b><span>made to order — nothing off a shelf</span></div>
            <div className="stat"><b>India-wide</b><span>tracked shipping from Barasat, WB 743355</span></div>
          </div>

          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...marquee, ...marquee].map((m, i) => (<span key={i}>{m} <i>✦</i></span>))}
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <section id="products" className="wrap reveal">
          <span className="kicker">What we print</span>
          <h2>Made to be <span className="hl">yours</span></h2>
          <p className="lead">Every product starts blank and ends as a one-of-one. Send a photo, a logo, your gaming setup, your favourite anime frame — if you can imagine it, we can print it.</p>
          <div className="grid">
            {PRODUCTS.map((p) => (
              <article className="card" key={p.id}>
                <div className="tile" style={{ background: p.grad }}>
                  <span className="glyph">{p.glyph}</span>
                  <Flame fill="rgba(255,255,255,.9)" className="tile-flame" />
                </div>
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                <div className="tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                <button className="go" onClick={() => pick(p)}>Customise this →</button>
              </article>
            ))}
          </div>
        </section>

        {/* CUSTOMISER */}
        <section id="customise" className="wrap reveal">
          <span className="kicker">Order builder</span>
          <h2>Build your <span className="hl">order brief</span></h2>
          <p className="lead">Pick your product, quantity and print style — we generate a clean order brief. Copy it and send it to the studio with your design, and we confirm price & delivery time before printing.</p>
          <div className="builder">
            <div className="panel">
              <h3>1 · Product</h3>
              <div className="chips">
                {PRODUCTS.map((p) => (
                  <button key={p.id} className={`chip ${product.id === p.id ? "on" : ""}`} onClick={() => setProduct(p)}>{p.name}</button>
                ))}
              </div>
              <h3>2 · Quantity</h3>
              <div className="qty-row">
                <input type="range" min="1" max="100" value={qty} onChange={(e) => setQty(+e.target.value)} />
                <span className="qty-num">{qty}<small>{qty === 1 ? "PIECE" : "PIECES"}</small></span>
              </div>
              <h3>3 · Print style</h3>
              <div className="chips">
                {STYLES.map((s) => (
                  <button key={s} className={`chip ${style === s ? "on" : ""}`} onClick={() => setStyle(s)}>{s}</button>
                ))}
              </div>
              <h3>4 · Extras</h3>
              <div className="checks">
                <label className="check"><input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} /> Gift wrap it</label>
                <label className="check"><input type="checkbox" checked={giftNote} onChange={(e) => setGiftNote(e.target.checked)} /> Add a gift note</label>
                <label className="check"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> I need it fast — priority dispatch</label>
              </div>
            </div>
            <div className="panel">
              <h3>Your order brief</h3>
              <div className="summary">{summary}</div>
              <div className="summary-actions">
                <button className="btn" onClick={copyBrief}>{copied ? "✓ Copied!" : "Copy Order Brief"}</button>
                <a className="btn ghost" href="#faq">How ordering works</a>
              </div>
              <p className="note">Send this brief to Soulfire Studio along with your photo or artwork. We reply with a design preview, final price and delivery estimate — printing starts only after you approve the preview.</p>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="wrap reveal">
          <span className="kicker">Inside the studio</span>
          <h2>Eight steps to <span className="hl">fire</span></h2>
          <p className="lead">This is the exact pipeline every Soulfire order travels — no shortcuts, no outsourcing.</p>
          <div className="steps">
            {STEPS.map(([t, d], i) => (
              <div className="step" key={t}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h4>{t}</h4><p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BRAND SUITE */}
        <section id="brand" className="wrap reveal">
          <span className="kicker">The Soulfire mark</span>
          <h2>One flame, <span className="hl">every form</span></h2>
          <p className="lead">Our identity — a flame folded into an S — in its official sky-blue and black system, from app icon to badge.</p>
          <div className="suite">
            <div className="swatch" style={{ background: "#04070c" }}><FlameGradient id="suiteGrad" /><span className="cap" style={{ color: "#9fd8ff" }}>Primary · Gradient on Black</span></div>
            <div className="swatch app" style={{ background: "linear-gradient(150deg,#38c8ff,#0057d9)" }}><Flame fill="#04070c" /><span className="cap" style={{ color: "#eaf6ff" }}>App Icon · Black on Sky</span></div>
            <div className="swatch" style={{ background: "#04070c" }}><Flame fill="#ffffff" /><span className="cap" style={{ color: "#9fd8ff" }}>Mono · White on Black</span></div>
            <div className="swatch round" style={{ background: "#0a0f16" }}><Flame fill="#12b5ff" /><span className="cap" style={{ color: "#9fd8ff" }}>Badge · Sky on Black</span></div>
            <div className="swatch light"><Flame fill="#04070c" /><span className="cap">Mono · Black on White</span></div>
            <div className="swatch" style={{ background: "radial-gradient(120% 120% at 50% 0%, #101c30, #05080d)" }}>
              <div style={{ textAlign: "center" }}>
                <Flame fill="#ffffff" />
                <div className="lockup-word" style={{ fontSize: 17, marginTop: 10 }}>SOUL<span style={{ color: "var(--sky)" }}>FIRE</span></div>
                <div style={{ letterSpacing: 6, fontSize: 9, color: "#cfeaff", marginTop: 4 }}>— STUDIO —</div>
              </div>
              <span className="cap" style={{ color: "#9fd8ff" }}>Lockup · Full Logo</span>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="wrap reveal">
          <span className="kicker">Why Soulfire</span>
          <h2>Prints that <span className="hl">last</span></h2>
          <div className="why">
            <div className="card"><div className="ico">🔥</div><h3>Permanent Print</h3><p>Sublimation fuses ink into the surface itself — no cracking, peeling or fading like stickers and vinyl.</p></div>
            <div className="card"><div className="ico">🎨</div><h3>Full Colour, Full Bleed</h3><p>Photo-quality gradients and tiny details, printed edge-to-edge in rich sky-deep colour.</p></div>
            <div className="card"><div className="ico">🛠️</div><h3>Made In-House</h3><p>Designed, printed, pressed and quality-checked by the studio — one pair of hands owns your order end-to-end.</p></div>
            <div className="card"><div className="ico">🚚</div><h3>Ships Across India</h3><p>Packed safe and dispatched with tracked delivery from Barasat, West Bengal — to Kolkata or anywhere in India.</p></div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="wrap reveal">
          <span className="kicker">Good to know</span>
          <h2>Questions, <span className="hl">answered</span></h2>
          <div className="faq">
            <details open><summary>How do I place an order?</summary><p>Build your brief in the order builder above, copy it, and send it to the studio with your photo or artwork. We reply with a design preview, final price and delivery estimate — printing starts only after you approve the preview.</p></details>
            <details><summary>What kind of photo or design works best?</summary><p>High-resolution images print sharpest. Send the original photo (not a screenshot or WhatsApp-compressed copy) where possible. Logos work best as PNG with a transparent background.</p></details>
            <details><summary>Will the print wash off or fade?</summary><p>No. Sublimation bonds the design into the product's coating or fabric, so it won't crack, peel or wash out. It's the same process used for sportswear and pro merchandise.</p></details>
            <details><summary>Where do you deliver, and how long does it take?</summary><p>We ship across India from Barasat, West Bengal (743355) with tracked delivery. Orders are made to order — dispatch happens after printing and quality check, and delivery time depends on your pincode, which we confirm with your quote.</p></details>
            <details><summary>Can I order in bulk for a team, event or business?</summary><p>Yes — matching tees, desk pads and keychains are some of our favourite orders. Set your quantity in the builder (up to 100) and mention it's a bulk order in your brief for a custom quote.</p></details>
          </div>
        </section>

        <footer>
          <div className="wrap foot">
            <div>
              <a className="brand" href="#top">
                <FlameGradient id="footFlame" />
                <span><span className="brand-name">SOUL<span className="fire">FIRE</span></span><br /><span className="brand-sub">STUDIO</span></span>
              </a>
              <p style={{ marginTop: 14 }}>Custom sublimation printing studio — mugs, t-shirts, mouse pads, keychains and bottles, made to order and shipped across India.</p>
            </div>
            <div>
              <p><strong style={{ color: "var(--text)" }}>Studio</strong><br />Barasat, West Bengal 743355<br />Dispatch: All India, tracked</p>
            </div>
            <div>
              <p><strong style={{ color: "var(--text)" }}>Explore</strong><br /><a href="#products">Products</a> · <a href="#customise">Order Builder</a><br /><a href="#process">Our Process</a> · <a href="#brand">Brand</a> · <a href="#faq">FAQ</a></p>
            </div>
            <p className="fine">© 2026 Soulfire Studio. Your design. Our fire. 🔥</p>
          </div>
        </footer>
      </main>
    </>
  );
}
