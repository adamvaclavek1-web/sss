import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoinFlip — Protect Your Streak",
  description: "Flip the coin, build your streak. Pay to survive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full" style={{ background: '#08070b' }}>
        {children}
      </body>
    </html>
  );
}
