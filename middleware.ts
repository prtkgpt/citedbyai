import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

const BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Bingbot",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "meta-externalagent",
];

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const ua = req.headers.get("user-agent") || "";
  const bot = BOTS.find((b) => ua.toLowerCase().includes(b.toLowerCase()));

  if (bot && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    event.waitUntil(
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/crawler_visits`, {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ bot, path: req.nextUrl.pathname }),
      }).catch(() => {})
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
