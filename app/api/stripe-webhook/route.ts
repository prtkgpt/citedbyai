import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" as any });

async function sendOutbidAlerts(
  admin: ReturnType<typeof supabaseAdmin>,
  bidUrl: string,
  bidDomain: string,
  cents: number
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { data } = await admin
      .from("listings")
      .select("url, domain, total_cents, email")
      .neq("url", bidUrl);
    if (!data) return;

    const { data: self } = await admin
      .from("listings")
      .select("total_cents")
      .eq("url", bidUrl)
      .single();
    const newTotal = self?.total_cents ?? cents;
    const oldTotal = newTotal - cents;

    // Everyone who was above this bidder before, and is below now, got displaced.
    const displaced = data
      .filter(
        (l) => l.email && l.total_cents > oldTotal && l.total_cents < newTotal
      )
      .slice(0, 5);

    for (const l of displaced) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "citedbyai.lol <onboarding@resend.dev>",
          to: l.email,
          subject: `${bidDomain} just outbid ${l.domain} on citedbyai.lol`,
          text: `Your listing ${l.domain} was just pushed down the board by ${bidDomain}.\n\nRank = total paid, and bids stack. Reclaim your spot: https://citedbyai.lol\n\nYou get this email because you bid on citedbyai.lol. It only fires when you get outbid.`,
        }),
      }).catch(() => {});
    }
  } catch {
    // alerts are best-effort, never block the webhook
  }
}

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
    const email = session.customer_details?.email ?? null;

    if (url && domain && cents > 0) {
      const admin = supabaseAdmin();
      const { error } = await admin.rpc("apply_bid", {
        p_url: url,
        p_domain: domain,
        p_description: description ?? "",
        p_cents: cents,
      });
      if (error) {
        console.error("apply_bid failed", error);
        return NextResponse.json({ error: "db error" }, { status: 500 });
      }
      if (email) {
        await admin.from("listings").update({ email }).eq("url", url);
      }
      revalidatePath("/");
      revalidatePath("/llms.txt");
      await sendOutbidAlerts(admin, url, domain, cents);
    }
  }

  return NextResponse.json({ received: true });
}
