import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paocoffeedays.com"),
  title: { default: "Matcha Days | paocoffeedays", template: "%s | paocoffeedays" },
  description: "Matcha Days by paocoffeedays. Discover Sift matcha, worth the whisk.",
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#4d5c33", width: "device-width", initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
