import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "../components/StoreContext";
import Header, { Footer } from "../components/Header";

const display = Archivo({ weight: ["600", "700", "800", "900"], subsets: ["latin"], variable: "--font-display" });
const body = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-body" });

const SITE = "https://soul-fire-studio.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Soulfire Studio — Custom Printed Mugs, Tees, Mouse Pads & More",
    template: "%s · Soulfire Studio",
  },
  description:
    "India's sky-blue flame studio: personalised mugs, t-shirts, desk pads, keychains and bottles with live design preview, free proof before printing and pan-India delivery.",
  keywords: ["custom mug", "photo mug", "custom t-shirt printing", "mouse pad custom", "personalised keychain", "sipper bottle custom", "sublimation printing India", "Soulfire Studio", "Barasat"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Soulfire Studio — Your Design. Our Fire.",
    description: "Custom sublimation printing — mugs, tees, mouse pads, keychains & bottles. Live preview, free proof, ships across India.",
    url: SITE,
    siteName: "Soulfire Studio",
    type: "website",
    images: [{ url: "/products/hero.jpg", width: 1600, height: 685, alt: "Soulfire Studio custom printed mug, bottle and desk pad with blue flame designs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soulfire Studio — Your Design. Our Fire.",
    description: "Custom sublimation printing — mugs, tees, mouse pads, keychains & bottles. Ships across India.",
    images: ["/products/hero.jpg"],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Soulfire Studio",
  url: SITE,
  image: SITE + "/products/hero.jpg",
  description: "Custom sublimation printing studio — personalised mugs, t-shirts, mouse pads, keychains and bottles, made to order and shipped across India.",
  address: { "@type": "PostalAddress", addressLocality: "Barasat", addressRegion: "West Bengal", postalCode: "743355", addressCountry: "IN" },
  areaServed: "IN",
  paymentAccepted: "UPI",
  priceRange: "₹₹",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <StoreProvider>
          <div className="bg-grid" />
          <Header />
          <main>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
