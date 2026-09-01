import { getListings } from "@/lib/supabase";

export const revalidate = 300;

export async function GET(
  _req: Request,
  { params }: { params: { domain: string } }
) {
  const domain = decodeURIComponent(params.domain)
    .replace(/[^a-z0-9.-]/gi, "")
    .toLowerCase();
  const listings = await getListings();
  const idx = listings.findIndex((l) => l.domain.toLowerCase() === domain);
  const label = idx === -1 ? "unranked" : `#${idx + 1}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="36" role="img" aria-label="citedbyai.lol rank ${label}">
  <rect width="200" height="36" rx="8" fill="#1d1c19"/>
  <text x="12" y="23" font-family="monospace" font-size="12" fill="#f6f4ee">citedbyai.lol</text>
  <rect x="118" y="6" width="70" height="24" rx="6" fill="#4056d6"/>
  <text x="153" y="23" font-family="monospace" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}
