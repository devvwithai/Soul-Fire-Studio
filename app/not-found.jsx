import Link from "next/link";
import { FlameGradient } from "../components/Flame";

export default function NotFound() {
  return (
    <div className="wrap page center">
      <FlameGradient id="nfFlame" className="auth-flame" />
      <h2 className="page-title">This page <span className="hl">burned out</span></h2>
      <p className="lead" style={{ margin: "12px auto 26px" }}>
        The page you're looking for doesn't exist — but plenty of blank canvases do.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link className="btn big" href="/shop">Shop the Collection</Link>
        <Link className="btn ghost big" href="/">Back Home</Link>
      </div>
    </div>
  );
}
