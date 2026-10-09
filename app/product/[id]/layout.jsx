import { SEED_PRODUCTS } from "../../../lib/db";

const SITE = "https://soul-fire-studio.vercel.app";

function findProduct(id) {
  return SEED_PRODUCTS.find((p) => p.id === id) || null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = findProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description:
        "That product doesn't exist or is no longer available at Soulfire Studio. Browse the shop for custom mugs, tees, mouse pads, keychains and bottles.",
      alternates: { canonical: `/product/${id}` },
      robots: { index: false, follow: true },
    };
  }

  const title = `${product.name} — ${product.tagline}`;
  const description = product.desc;
  const url = `/product/${product.id}`;
  const image = {
    url: product.img,
    alt: `${product.name} — ${product.tagline} · Soulfire Studio`,
  };

  return {
    title,
    description,
    keywords: [
      product.name,
      `custom ${product.cat.toLowerCase()}`,
      `personalised ${product.name.toLowerCase()}`,
      product.tagline,
      "sublimation printing India",
      "Soulfire Studio",
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} · Soulfire Studio`,
      description,
      url,
      siteName: "Soulfire Studio",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · Soulfire Studio`,
      description,
      images: [product.img],
    },
  };
}

export default async function ProductLayout({ children, params }) {
  const { id } = await params;
  const product = findProduct(id);

  if (!product) return <>{children}</>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    image: SITE + product.img,
    category: product.cat,
    url: `${SITE}/product/${product.id}`,
    brand: { "@type": "Brand", name: "Soulfire Studio" },
    offers: {
      "@type": "Offer",
      url: `${SITE}/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Soulfire Studio" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
