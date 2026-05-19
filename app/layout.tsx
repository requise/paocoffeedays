import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paocoffeedays.com"),
  title: {
    default: "paocoffeedays | Coffee UGC Creator in Metro Manila",
    template: "%s | paocoffeedays"
  },
  description:
    "Coffee UGC creator Pao Canopin creates short-form reels, product unboxing, satire, lifestyle content, and paid social campaigns for brands in the Philippines.",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "paocoffeedays",
    "Pao Canopin",
    "coffee UGC",
    "Metro Manila UGC creator",
    "Philippines UGC creator",
    "coffee creator",
    "short-form video creator",
    "TikTok UGC Philippines",
    "Instagram Reels creator",
    "coffee brand content",
    "brand collaborations",
    "content creator",
    "specialty coffee",
    "Philippines creator"
  ],
  authors: [{ name: "Pao Canopin" }],
  creator: "Pao Canopin",
  publisher: "paocoffeedays",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    title: "paocoffeedays | Coffee UGC Creator in Metro Manila",
    description:
      "Short-form coffee UGC, product unboxing, satire, lifestyle reels, and brand collaborations by Pao Canopin.",
    type: "website",
    url: "https://paocoffeedays.com",
    siteName: "paocoffeedays",
    locale: "en_PH",
    images: [
      {
        url: "/pao-profile.jpg",
        width: 427,
        height: 427,
        alt: "Pao Canopin of paocoffeedays"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "paocoffeedays | Coffee UGC Creator in Metro Manila",
    description:
      "Coffee-focused UGC with humor, visuals, personality, and brand-ready short-form storytelling.",
    images: ["/pao-profile.jpg"]
  }
};

export const viewport: Viewport = {
  themeColor: "#050505",
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
