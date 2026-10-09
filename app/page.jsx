"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { FlameGradient } from "../components/Flame";

const STEPS = [
  ["Order In", "Your brief lands — product, design and quantity locked."],
  ["Design Proof", "We send a free preview. Printing starts only when you approve."],
  ["Print", "High-resolution sublimation printing, deep rich colour."],
  ["Heat Press", "Heat + pressure fuse the design permanently into the surface."],
  ["Quality Check", "Every piece inspected — colour, alignment, finish."],
  ["Pack", "Wrapped safe for the road, gift-ready if you asked."],
  ["Ship", "Dispatched from Barasat, WB with tracked Delhivery delivery."],
  ["Delivered", "Your design, in your hands."],
];

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => {});
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const marquee = ["CUSTOM MUGS", "PHOTO TEES", "DESK PADS", "KEYCHAINS", "SIPPER BOTTLES", "FREE DESIGN PROOF", "SHIPS ACROSS INDIA", "NO CRACK · NO PEEL · NO FADE"];

  return (
    <>
      {/* HERO */}
      <div className="hero2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero2-bg" src="/products/hero.jpg" alt="Soulfire Studio custom printed mug, bottle and desk pad with blue flame designs" fetchPriority="high" />
        <div className="hero2-shade" />
        <div className="wrap hero2-inner">
          <span className="kicker light">Custom Printing Studio · Barasat → All India</span>
          <h1>YOUR DESIGN.<br />OUR <span className="hl">FIRE.</span></h1>
          <p>Upload a photo. Watch it become a mug, a tee, a desk pad that stops people mid-scroll. Printed in-house, proofed by you, shipped across India.</p>
          <div className="hero-cta">
            <Link className="btn big" href="/shop">Shop the Collection</Link>
            <Link className="btn ghost big" href="/product/mug">Try the Customiser</Link>
          </div>
          <div className="badges">
            <span className="badge">Free design proof before printing</span>
            <span className="badge">Live preview customiser</span>
            <span className="badge">Free shipping over ₹699</span>
          </div>
        </div>
      </div>
      <div className="marquee"><div className="marquee-track">{[...marquee, ...marquee].map((m, i) => <span key={i}>{m} <i>✦</i></span>)}</div></div>

      {/* DIWALI */}
      <section className="wrap reveal" style={{ paddingTop: 28 }}>
        <div className="diwali">
          <div>
            <span className="kicker">🪔 Diwali Gifting · Limited</span>
            <h2>Light up someone's Diwali — <span className="hl">15% off</span> custom gifts</h2>
            <p className="lead">Photo mugs, name bottles and keychains that feel personal, not purchased-last-minute. Use code <b className="code-chip">DIWALI15</b> at checkout. Order early — every piece is made to order.</p>
          </div>
          <Link className="btn big" href="/shop">Shop Diwali Gifts →</Link>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="wrap reveal">
        <div className="sec-head">
          <div>
            <span className="kicker">The Collection</span>
            <h2>Pick your <span className="hl">canvas</span></h2>
          </div>
          <Link className="btn ghost" href="/shop">View all →</Link>
        </div>
        <div className="pgrid">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
          {!products.length && <p className="lead">Loading the collection…</p>}
        </div>
      </section>

      {/* CUSTOMISER TEASER */}
      <section className="wrap reveal">
        <div className="teaser">
          <div>
            <span className="kicker">The Soulfire Customiser</span>
            <h2>See it <span className="hl">before</span> we print it</h2>
            <p className="lead">Upload your photo and watch it land on the product in real time. We check the quality, warn you if it's too small, and send a free proof before a single drop of ink is pressed.</p>
            <ul className="ticks">
              <li>✓ Live preview on the actual product</li>
              <li>✓ Photo quality traffic-light — sharp, ok, or too small</li>
              <li>✓ Your uploads saved in My Designs — reuse on any product</li>
              <li>✓ Free human proof on WhatsApp before printing</li>
            </ul>
            <Link className="btn" href="/product/pad-large" style={{ marginTop: 20 }}>Start Designing</Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="teaser-img" src="/products/pad-large.jpg" alt="Custom desk mouse pad with blue flame artwork in a gaming setup" />
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="wrap reveal">
        <span className="kicker">Inside the studio</span>
        <h2>Eight steps to <span className="hl">fire</span></h2>
        <p className="lead">The exact pipeline every Soulfire order travels — and the same timeline you'll watch live in your account.</p>
        <div className="steps">
          {STEPS.map(([t, d], i) => (
            <div className="step" key={t}><span className="num">{String(i + 1).padStart(2, "0")}</span><h4>{t}</h4><p>{d}</p></div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="wrap reveal">
        <span className="kicker">Why Soulfire</span>
        <h2>Prints that <span className="hl">last</span></h2>
        <div className="why">
          <div className="card"><div className="ico">🔥</div><h3>Permanent Print</h3><p>Sublimation fuses ink into the surface itself — no cracking, peeling or fading like stickers and vinyl.</p></div>
          <div className="card"><div className="ico">👁️</div><h3>Proof Before Print</h3><p>You approve the exact design preview before we print. No surprises, ever.</p></div>
          <div className="card"><div className="ico">🛠️</div><h3>Made In-House</h3><p>Designed, printed, pressed and quality-checked under one roof — one pair of hands owns your order end-to-end.</p></div>
          <div className="card"><div className="ico">🚚</div><h3>Real Delivery Dates</h3><p>Pincode-based delivery estimates at checkout, powered by our contracted Delhivery rates from Barasat 743355.</p></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap reveal">
        <span className="kicker">Good questions</span>
        <h2>Before you <span className="hl">ask</span></h2>
        <div className="faq">
          {[
            ["Will my print fade or peel?", "No. Sublimation fuses the ink into the surface itself — there is no sticker or film to crack, peel or wash off. Treat it like any quality mug, tee or bottle and the print outlives the product."],
            ["Do I see the design before you print?", "Always. You preview it live here (photo, 3D 360° and video spin), and we send a free human proof before printing. Nothing goes to press without your approval."],
            ["How long does delivery take?", "We make your piece in about 2 days, then Delhivery takes 1–3 days within West Bengal and 3–5 days across India. Enter your pincode on any product page for your exact window."],
            ["What photo quality do I need?", "The customiser checks automatically — green means print-sharp. As a rule, anything shot on a modern phone works. Small WhatsApp forwards are the usual problem; we'll warn you before printing, not after."],
            ["Can I order in bulk for my team or event?", "Yes — 25+ pieces unlock bulk pricing. Place the order with a note at checkout (or add the pieces and mention quantities), and we'll confirm your bulk quote on the proof before printing."],
            ["What if my order arrives damaged?", "Tell us within 7 days with a photo of the damage and we'll reprint or refund — your choice. Custom doesn't mean you're stuck with it."],
          ].map(([q, a]) => (
            <details className="faq-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* BRAND */}
      <section id="brand" className="wrap reveal">
        <div className="brand-strip">
          <FlameGradient id="brandFlame" className="brand-strip-flame" />
          <div>
            <div className="lockup-word" style={{ fontSize: "clamp(22px,3.4vw,34px)" }}>SOUL<span style={{ color: "var(--sky)" }}>FIRE</span></div>
            <div className="lockup-sub" style={{ justifyContent: "flex-start" }}>STUDIO</div>
            <p className="lead" style={{ marginTop: 12 }}>One flame, folded into an S. Sky blue on black — the mark of every piece that leaves this studio.</p>
          </div>
          <Link className="btn" href="/shop">Shop the Mark</Link>
        </div>
      </section>
    </>
  );
}
