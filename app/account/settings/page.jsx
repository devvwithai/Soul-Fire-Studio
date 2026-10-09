"use client";
import { useState } from "react";
import { useStore } from "../../../components/StoreContext";

export default function Settings() {
  const { user, setUser, say } = useStore();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [dob, setDob] = useState(user.dob || "");
  const [settings, setSettings] = useState(user.settings || { offers: true, orderUpdates: true });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    const r = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, dob, settings }) });
    const d = await r.json();
    if (d.user) { setUser(d.user); setMsg("Profile saved ✓"); say("Settings saved"); } else setErr(d.error || "Save failed");
  };
  const savePw = async (e) => {
    e.preventDefault(); setErr(""); setMsg("");
    const r = await fetch("/api/me/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pw) });
    const d = await r.json();
    if (d.ok) { setPw({ current: "", next: "" }); setMsg("Password changed ✓ Use the new one next login."); }
    else setErr(d.error || "Password change failed");
  };

  return (
    <>
      <h2 className="acct-title">Profile <span className="hl">settings</span></h2>
      <form className="panel settings-form" onSubmit={saveProfile}>
        <h3>Profile</h3>
        <label className="fld-label">Full name</label>
        <input className="inp full" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="fld-label">Email (login ID — cannot be changed)</label>
        <input className="inp full" value={user.email} disabled />
        <label className="fld-label">Phone</label>
        <input className="inp full" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label className="fld-label">Birthday (for a surprise on your day 🎂)</label>
        <input className="inp full" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        <h3 style={{ marginTop: 22 }}>Notifications</h3>
        <label className="check"><input type="checkbox" checked={settings.orderUpdates} onChange={(e) => setSettings({ ...settings, orderUpdates: e.target.checked })} /> Order updates (proof ready, dispatched, delivered)</label>
        <label className="check"><input type="checkbox" checked={settings.offers} onChange={(e) => setSettings({ ...settings, offers: e.target.checked })} /> Offers & new design drops</label>
        <button className="btn" style={{ marginTop: 16 }}>Save Profile</button>
      </form>

      <form className="panel settings-form" style={{ marginTop: 16 }} onSubmit={savePw}>
        <h3>Change password</h3>
        <input className="inp full" type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        <input className="inp full" type="password" placeholder="New password (6+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        <button className="btn ghost">Update Password</button>
        {msg && <p className="pin-ok" style={{ marginTop: 12 }}>{msg}</p>}
        {err && <p className="err" style={{ marginTop: 12 }}>{err}</p>}
      </form>
    </>
  );
}
