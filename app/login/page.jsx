"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "../../components/StoreContext";
import { FlameGradient } from "../../components/Flame";

function LoginForm() {
  const { setUser } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    setBusy(false);
    if (d.user) { setUser(d.user); router.push(params.get("next") || "/account"); }
    else setErr(d.error || "Login failed");
  };

  return (
    <div className="wrap page auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <FlameGradient id="loginFlame" className="auth-flame" />
        <h2>Welcome <span className="hl">back</span></h2>
        <p className="lead" style={{ fontSize: 15 }}>Login to track orders, reuse your designs and check out faster.</p>
        <input className="inp full" type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="inp full" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="err">{err}</p>}
        <button className="btn big full" disabled={busy}>{busy ? "Logging in…" : "Login"}</button>
        <p className="note center">New to Soulfire? <Link href="/register" style={{ color: "var(--sky)" }}>Create an account →</Link></p>
      </form>
    </div>
  );
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>;
}
