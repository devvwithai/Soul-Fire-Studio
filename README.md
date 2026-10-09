# 🔥 Soulfire Studio — Full-Stack E-Commerce Store

Official website for **Soulfire Studio**, a custom sublimation printing studio from
Barasat, West Bengal, shipping across India.

**Stack:** Next.js 15 (App Router) · React 19 · deployed on Vercel
**Brand:** Sky blue (`#12b5ff` → `#0057d9`) on black (`#04070c`), flame-in-S logo mark
(vectorised from the studio's original logo assets, in `components/Flame.jsx`).

## Products
Custom mugs · T-shirts · Large & classic mouse pads · MDF keychains · 750ml sipper bottles

## Highlights
- Full **e-commerce store**: shop with category filters/search/sort, product pages, cart, checkout
- **Live design customiser** — upload a photo, see it on the product instantly, with a print-quality check
- **Accounts**: register/login, orders with live 8-step tracking, saved designs, wishlist, addresses, profile settings
- **Admin panel**: advance orders through the pipeline, edit prices/MRP/stock live
- **Demo UPI checkout** (Cashfree live payments plug in later); delivery priced from contracted Delhivery rates, free over ₹699
- Data in Vercel Blob, sessions via signed JWT cookies, passwords bcrypt-hashed

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Push to `main` — Vercel builds and deploys automatically.
