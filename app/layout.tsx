import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paocanopin.com"),
  title: "Pao Canopin | Brewing Stories. Creating Influence.",
  description:
    "The official portfolio of Pao Canopin, showcasing coffee culture, creative campaigns, brand collaborations, and digital storytelling.",
  keywords: [
    "Pao Canopin",
    "coffee creator",
    "brand collaborations",
    "content creator",
    "specialty coffee",
    "digital storytelling",
    "media kit"
  ],
  openGraph: {
    title: "Pao Canopin | Coming Soon",
    description:
      "Coffee culture, creative campaigns, brand collaborations, and digital storytelling.",
    type: "website",
    url: "https://paocanopin.com",
    siteName: "Pao Canopin"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pao Canopin | Coming Soon",
    description:
      "A premium personal portfolio for coffee, lifestyle, and digital influence."
  }
};

export const viewport: Viewport = {
  themeColor: "#130d0a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
