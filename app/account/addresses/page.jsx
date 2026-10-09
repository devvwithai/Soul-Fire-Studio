"use client";
import { useState } from "react";
import { useStore } from "../../../components/StoreContext";

export default function Addresses() {
  const { user, refreshUser, say } = useStore();
  const [form, setForm] = useState({ name: "", phone: "", pincode: "", line: "", city: "", state: "", landmark: "", isDefault: false });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/me/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.user) { await refreshUser(); setForm({ name: "", phone: "", pincode: "", line: "", city: "", state: "", landmark: "", isDefault: false }); say("Address saved"); }
    else setErr(d.error || "Could not save");
  };
  const del = async (id) => {
    await fetch(`/api/me/addresses?id=${id}`, { method: "DELETE" });
    await refreshUser(); say("Address removed");
  };

  return (
    <>
      <h2 className="acct-title">Saved <span className="hl">addresses</span></h2>
      <div className="addr-grid">
        {user.addresses?.map((a) => (
          <div className="panel addr-panel" key={a.id}>
            <b>{a.name}</b> {a.isDefault && <span className="admin-tag">DEFAULT</span>}
            <p>{a.line}<br />{a.city}, {a.state} — <b>{a.pincode}</b><br />📞 {a.phone}{a.landmark ? <><br />Near {a.landmark}</> : null}</p>
            <button className="rm-link" onClick={() => del(a.id)}>Remove</button>
          </div>
        ))}
      </div>
      <form className="panel addr-form" style={{ marginTop: 18 }} onSubmit={submit}>
        <h3>Add a new address</h3>
        <input className="inp" required placeholder="Full name" value={form.name} onChange={set("name")} />
        <input className="inp" required placeholder="Phone" value={form.phone} onChange={set("phone")} />
        <input className="inp" required placeholder="Pincode" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} />
        <input className="inp" required placeholder="City" value={form.city} onChange={set("city")} />
        <input className="inp full" required placeholder="Address — house no, street, area" value={form.line} onChange={set("line")} />
        <input className="inp" required placeholder="State" value={form.state} onChange={set("state")} />
        <input className="inp" placeholder="Landmark (optional)" value={form.landmark} onChange={set("landmark")} />
        <label className="check full"><input type="checkbox" checked={form.isDefault} onChange={set("isDefault")} /> Make this my default address</label>
        {err && <p className="err full">{err}</p>}
        <button className="btn">Save Address</button>
      </form>
    </>
  );
}
