import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { url, domain, description } = session.metadata ?? {};
    const cents = session.amount_total ?? 0;

    if (url && domain && cents > 0) {
      const { error } = await supabaseAdmin().rpc("apply_bid", {
        p_url: url,
        p_domain: domain,
        p_description: description ?? "",
        p_cents: cents,
      });
      if (error) {
        console.error("apply_bid failed", error);
        return NextResponse.json({ error: "db error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
