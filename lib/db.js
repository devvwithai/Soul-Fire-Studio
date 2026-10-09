import { put, get } from "@vercel/blob";
import bcrypt from "bcryptjs";

const DB_PATH = "soulfire/db.json";
let cache = null;
let writeChain = Promise.resolve();

export const ORDER_STATUSES = [
  "Placed",
  "Design Proof",
  "Printing",
  "Quality Check",
  "Packed",
  "Dispatched",
  "Out for Delivery",
  "Delivered",
];

export const SEED_PRODUCTS = [
  {
    id: "mug", slug: "custom-photo-mug", name: "Custom Photo Mug", cat: "Mugs",
    price: 299, mrp: 499, img: "/products/mug.jpg", weight: 1, badge: "Bestseller",
    tagline: "11oz ceramic · full-wrap print",
    desc: "Your photo, artwork or logo wrapped around a glossy 11oz ceramic mug. Dishwasher-safe, microwave-safe, and the print is fused in — it will never fade, crack or peel.",
    options: { label: "Mug colour", values: ["Classic White", "Inner Sky Blue", "Inner Black"] },
    print: { x: 14, y: 16, w: 52, h: 64, radius: 6 },
  },
  {
    id: "tee", slug: "custom-printed-tshirt", name: "Custom Printed T-Shirt", cat: "Apparel",
    price: 499, mrp: 799, img: "/products/tee.jpg", weight: 0.5, badge: "Premium",
    tagline: "Sublimation tee · chest or full print",
    desc: "A soft, breathable sublimation tee with your design printed in rich, permanent colour. Built for squads, events, birthdays and brands that want to be seen.",
    options: { label: "Size", values: ["S", "M", "L", "XL", "XXL"] },
    print: { x: 33, y: 24, w: 34, h: 34, radius: 8 },
  },
  {
    id: "pad-large", slug: "large-desk-mouse-pad", name: "Large Desk Mouse Pad", cat: "Desk",
    price: 349, mrp: 699, img: "/products/pad-large.jpg", weight: 0.5, badge: "Setup Upgrade",
    tagline: "Extended desk size · stitched edges",
    desc: "Full desk coverage with a smooth gaming-grade surface and anti-slip rubber base. Turn your battlestation into a statement with edge-to-edge custom art.",
    options: { label: "Design style", values: ["Full-bleed Artwork", "Photo Collage", "Logo / Branding"] },
    print: { x: 8, y: 10, w: 84, h: 80, radius: 10 },
  },
  {
    id: "pad-small", slug: "classic-mouse-pad", name: "Classic Mouse Pad", cat: "Desk",
    price: 199, mrp: 349, img: "/products/pad-small.jpg", weight: 0.5, badge: null,
    tagline: "Everyday size · crisp detail",
    desc: "The everyday essential, personalised. Crisp sublimation print that survives daily clicks, coffee spills and chaos — with a grippy anti-slip base.",
    options: { label: "Design style", values: ["Full-bleed Artwork", "Photo", "Name / Text"] },
    print: { x: 10, y: 10, w: 80, h: 80, radius: 10 },
  },
  {
    id: "keychain", slug: "mdf-photo-keychain", name: "MDF Photo Keychain", cat: "Gifts",
    price: 149, mrp: 299, img: "/products/keychain.jpg", weight: 0.5, badge: "Under ₹199",
    tagline: "Double-sided print · metal ring",
    desc: "Small, tough and full of personality. Photos, names, anime art, couple prints — pocket-sized Soulfire with a premium double-sided print.",
    options: { label: "Sides", values: ["Single Side", "Double Side (+₹50)"] },
    print: { x: 30, y: 18, w: 40, h: 52, radius: 12 },
  },
  {
    id: "bottle", slug: "sipper-bottle-750ml", name: "Sipper Bottle 750ml", cat: "Bottles",
    price: 449, mrp: 749, img: "/products/bottle.jpg", weight: 1, badge: null,
    tagline: "750ml aluminium · name or photo print",
    desc: "A lightweight 750ml aluminium sipper with your name or design fused into the finish. Gym, school, office — unmistakably, permanently yours.",
    options: { label: "Bottle colour", values: ["Matte Black", "Steel Silver", "Sky Blue"] },
    print: { x: 36, y: 30, w: 28, h: 44, radius: 8 },
  },
];

function seed() {
  return {
    users: [],
    products: SEED_PRODUCTS.map((p) => ({ ...p, active: true, stock: 50 })),
    orders: [],
    designs: [],
    coupons: [
      { code: "WELCOME10", pct: 10, active: true },
      { code: "DIWALI15", pct: 15, active: true },
    ],
    seq: { order: 1000 },
    seededAt: new Date().toISOString(),
  };
}

async function load() {
  if (cache) return cache;
  try {
    const res = await get(DB_PATH, { access: "private" });
    if (res && res.stream) {
      const text = await new Response(res.stream).text();
      cache = JSON.parse(text);
      if (!Array.isArray(cache.coupons)) {
        cache.coupons = [
          { code: "WELCOME10", pct: 10, active: true },
          { code: "DIWALI15", pct: 15, active: true },
        ];
      }
      return cache;
    }
  } catch {}
  cache = seed();
  await persist();
  return cache;
}

async function persist() {
  await put(DB_PATH, JSON.stringify(cache), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readDB() {
  return load();
}

/** Serialised read-modify-write — safe for a small studio store. */
export async function updateDB(fn) {
  const run = writeChain.then(async () => {
    const db = await load();
    const out = await fn(db);
    await persist();
    return out;
  });
  writeChain = run.catch(() => {});
  return run;
}

export async function ensureAdmin(db) {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!email) return;
  if (!db.users.some((u) => u.email === email)) {
    const hash = await bcrypt.hash(process.env.ADMIN_TEMP_PASSWORD || "ChangeMe@123", 10);
    db.users.push({
      id: "admin-1",
      name: "Soulfire Admin",
      email,
      phone: "",
      passHash: hash,
      role: "admin",
      wishlist: [],
      addresses: [],
      settings: { offers: true, orderUpdates: true },
      createdAt: new Date().toISOString(),
    });
    await persist();
  }
}

export function publicUser(u) {
  if (!u) return null;
  const { passHash, ...rest } = u;
  return rest;
}

export const uid = (p) => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
