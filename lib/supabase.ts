import { createClient } from "@supabase/supabase-js";

export type Listing = {
  id: string;
  url: string;
  domain: string;
  description: string | null;
  total_cents: number;
  bid_count: number;
  last_bid_at: string;
};

export const PUBLIC_COLS =
  "id, url, domain, description, total_cents, bid_count, last_bid_at";

export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getListings(): Promise<Listing[]> {
  const { data } = await supabasePublic()
    .from("listings")
    .select(PUBLIC_COLS)
    .order("total_cents", { ascending: false })
    .limit(200);
  return (data as Listing[] | null) ?? [];
}

export async function getLastCrawlerVisit(): Promise<{ bot: string; visited_at: string } | null> {
  const { data } = await supabasePublic()
    .from("crawler_visits")
    .select("bot, visited_at")
    .order("visited_at", { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
}
