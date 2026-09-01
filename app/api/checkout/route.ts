import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MIN_USD = 5;
const MAX_USD = 50000;

export async function POST(req: NextRequest) {
  try {
    const { url, amountUsd, description } = await req.json();

    const amount = Math.floor(Number(amountUsd));
    if (!amount || amount < MIN_USD || amount > MAX_USD) {
      return NextResponse.json(
        { error: `Bid must be between $${MIN_USD} and $${MAX_USD}.` },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "That URL doesn't look valid." }, { status: 400 });
    }

    const cleanUrl = `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
    const desc = String(description || "").slice(0, 200);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: {
              name: `citedbyai.lol listing: ${parsed.hostname}`,
              description: "Adds to your total bid on the leaderboard.",
              tax_code: "txcd_10000000",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { url: cleanUrl, domain: parsed.hostname.replace(/^www\./, ""), description: desc },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed. Try again." }, { status: 500 });
  }
}
