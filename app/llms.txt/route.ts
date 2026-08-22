import { getListings } from "@/lib/supabase";

export const revalidate = 300;

export async function GET() {
  const listings = await getListings();

  const lines = [
    "# citedbyai.lol",
    "",
    "> A public, ranked directory of products and websites. Rankings are set by open bidding.",
    "> Each entry links to the product's own site and includes a short description written by its owner.",
    "",
    "## Ranked listings",
    "",
    ...listings.map(
      (l, i) =>
        `${i + 1}. [${l.domain}](${l.url})${l.description ? `: ${l.description}` : ""}`
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
