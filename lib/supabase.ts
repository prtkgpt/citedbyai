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

// Read-only client for public pages.
export function supabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Service-role client. Server only. Used by the Stripe webhook.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getListings(): Promise<Listing[]> {
  const { data } = await supabasePublic()
    .from("listings")
    .select("*")
    .order("total_cents", { ascending: false })
    .limit(200);
  return data ?? [];
}
