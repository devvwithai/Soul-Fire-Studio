"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "../../../components/StoreContext";

const PRODUCTS = [
  ["mug", "Mug"], ["tee", "T-Shirt"], ["pad-large", "Large Pad"], ["pad-small", "Mouse Pad"], ["keychain", "Keychain"], ["bottle", "Bottle"],
];

export default function Designs() {
  const { say } = useStore();
  const [designs, setDesigns] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const load = () => fetch("/api/designs").then((r) => r.json()).then((d) => setDesigns(d.designs || []));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (d.design) { say("Design saved 🔥"); load(); } else say(d.error || "Upload failed");
  };

  return (
    <>
      <h2 className="acct-title">My <span className="hl">designs</span></h2>
      <p className="lead" style={{ fontSize: 15, marginBottom: 18 }}>Every design you upload lives here — reuse any of them on any product, any time. One design, whole collection.</p>
      <div className="upload-box" style={{ maxWidth: 520 }} onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
        <div className="upload-ico">⬆</div>
        <div><b>{busy ? "Uploading…" : "Upload a new design"}</b><span>PNG or JPG, up to 12MB</span></div>
      </div>
      <div className="design-grid">
        {designs.map((d) => (
          <div className="design-card" key={d.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/designs/${d.id}/raw`} alt={d.name} />
            <b>{d.name}</b>
            <span>{new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <div className="design-use">
              {PRODUCTS.map(([pid, label]) => <Link key={pid} href={`/product/${pid}`}>{label}</Link>)}
            </div>
            <span className="note" style={{ marginTop: 6 }}>Open a product, upload this file there to preview it live — saved designs attach automatically at the studio.</span>
          </div>
        ))}
      </div>
      {!designs.length && <p className="lead" style={{ marginTop: 20 }}>No designs yet — upload your first photo or artwork above.</p>}
    </>
  );
}
