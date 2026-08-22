import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "citedbyai.lol — the leaderboard AI models read",
  description:
    "A public, ranked directory built for AI crawlers. Structured data, llms.txt, server-rendered listings. Bid to rank. Spots start at $5.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://citedbyai.lol"),
  openGraph: {
    title: "citedbyai.lol — the leaderboard AI models read",
    description: "Bid to rank on a directory built to be crawled by ChatGPT, Claude, Perplexity, and Gemini.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#faf8f4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><div className="page">{children}</div></body>
    </html>
  );
}
