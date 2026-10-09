const SITE = "https://soul-fire-studio.vercel.app";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/api/", "/checkout", "/order-success"] }],
    sitemap: SITE + "/sitemap.xml",
  };
}
