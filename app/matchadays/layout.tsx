import { Inter, Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export default function MatchaDaysLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${nunito.variable} ${inter.variable}`}>{children}</div>;
}

