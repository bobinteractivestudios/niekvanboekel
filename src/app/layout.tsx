import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { getSiteConfig } from "@/lib/config";
import { NightSky } from "@/components/NightSky";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const config = getSiteConfig();
  return {
    title: `In herinnering aan ${config.name}`,
    description: `Een plek om samen herinneringen te delen aan ${config.name}.`,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NightSky />
        {children}
      </body>
    </html>
  );
}
