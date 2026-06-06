import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoinFlip — Protect Your Streak",
  description: "Flip the coin, build your streak. Pay to survive. The ultimate streak challenge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`} style={{ background: '#0a0a0f' }}>
        {/* CRT scanlines overlay */}
        <div className="crt-overlay" aria-hidden="true" />
        {/* Noise overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
