import { SEED_PRODUCTS } from "../lib/db";

const SITE = "https://soul-fire-studio.vercel.app";

export default function sitemap() {
  const now = new Date();
  const pages = ["", "/shop", "/track", "/cart", "/login", "/register"].map((p) => ({
    url: SITE + p,
    lastModified: now,
    changeFrequency: p === "" || p === "/shop" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/shop" ? 0.9 : 0.5,
  }));
  const products = SEED_PRODUCTS.map((p) => ({
    url: `${SITE}/product/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...pages, ...products];
}
