"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "../../components/StoreContext";

const NAV = [
  ["/account", "Overview"], ["/account/orders", "My Orders"], ["/account/designs", "My Designs"],
  ["/account/wishlist", "Wishlist"], ["/account/addresses", "Addresses"], ["/account/settings", "Settings"],
];

export default function AccountLayout({ children }) {
  const { user, logout } = useStore();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => { if (user === null) router.push("/login?next=/account"); }, [user, router]);
  if (!user) return <div className="wrap page"><p className="lead">Loading your account…</p></div>;
  return (
    <div className="wrap page">
      <div className="acct">
        <aside className="acct-side">
          <div className="acct-user">
            <span className="avatar lg">{(user.name || "S").slice(0, 1).toUpperCase()}</span>
            <div><b>{user.name}</b><span>{user.email}</span>{user.role === "admin" && <span className="admin-tag">STUDIO ADMIN</span>}</div>
          </div>
          <nav>
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={path === href ? "on" : ""}>{label}</Link>
            ))}
            {user.role === "admin" && <Link href="/admin" className={path === "/admin" ? "on" : ""}>Admin Panel</Link>}
            <button onClick={async () => { await logout(); router.push("/"); }}>Logout</button>
          </nav>
        </aside>
        <div className="acct-main">{children}</div>
      </div>
    </div>
  );
}
