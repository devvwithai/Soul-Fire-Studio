import { FlameGradient } from "../components/Flame";

export default function Loading() {
  return (
    <div className="wrap page" style={{ display: "grid", placeItems: "center", minHeight: "55vh", textAlign: "center" }}>
      <div>
        <FlameGradient id="loadFlame" className="auth-flame" />
        <p className="lead" style={{ marginTop: 14 }}>Warming up the press…</p>
      </div>
    </div>
  );
}
