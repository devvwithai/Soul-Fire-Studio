"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "../../components/StoreContext";
import { FlameGradient } from "../../components/Flame";

export default function Register() {
  const { setUser } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    setBusy(false);
    if (d.user) { setUser(d.user); router.push("/account"); }
    else setErr(d.error || "Could not create account");
  };

  return (
    <div className="wrap page auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <FlameGradient id="regFlame" className="auth-flame" />
        <h2>Join the <span className="hl">fire</span></h2>
        <p className="lead" style={{ fontSize: 15 }}>One account for orders, designs, wishlist and faster checkout.</p>
        <input className="inp full" required placeholder="Full name" value={form.name} onChange={set("name")} />
        <input className="inp full" type="email" required placeholder="Email address" value={form.email} onChange={set("email")} />
        <input className="inp full" placeholder="Phone (for delivery updates)" value={form.phone} onChange={set("phone")} />
        <input className="inp full" type="password" required minLength={6} placeholder="Password (6+ characters)" value={form.password} onChange={set("password")} />
        {err && <p className="err">{err}</p>}
        <button className="btn big full" disabled={busy}>{busy ? "Creating…" : "Create Account"}</button>
        <p className="note center">Already have an account? <Link href="/login" style={{ color: "var(--sky)" }}>Login →</Link></p>
      </form>
    </div>
  );
}
