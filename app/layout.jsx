import { Michroma, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Soulfire Studio — Custom Printed Mugs, Tees, Mouse Pads & More",
  description:
    "Soulfire Studio is a custom sublimation printing studio from Barasat, West Bengal, shipping across India. Personalised mugs, t-shirts, mouse pads, keychains and bottles — your design, our fire.",
  openGraph: {
    title: "Soulfire Studio",
    description: "Custom sublimation printing — mugs, tees, mouse pads, keychains & bottles. Ships across India.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
