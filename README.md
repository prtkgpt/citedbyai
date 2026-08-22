# citedbyai.lol

The leaderboard AI models read. Pay-to-rank directory served as clean HTML, JSON-LD ItemList, and a live llms.txt. Rank = total paid per URL. Bids stack.

## Deploy in ~30 minutes

1. **Supabase.** New project. SQL editor: paste and run `supabase/schema.sql`. Copy project URL, anon key, service role key.
2. **Stripe.** Live mode. Copy secret key.
3. **Vercel.** Push this repo to GitHub, import into Vercel. Add all env vars from `.env.example`. Deploy.
4. **Stripe webhook.** Dashboard > Webhooks > Add endpoint: `https://YOURDOMAIN/api/stripe-webhook`, event `checkout.session.completed`. Copy signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel. Redeploy.
5. **Domain.** Point it at Vercel. Set `NEXT_PUBLIC_SITE_URL`.
6. **Test.** Make a real $5 bid yourself. Confirm it appears on the board within 60s (page revalidates every minute).

## Seed before launch

An empty board kills the joke. Bid $5 to $25 on 5 to 10 of your own products first so the board looks alive and you hold #1 at launch.

## Launch checklist

- Post the build story with a screenshot of the "what crawlers see" toggle
- Bid citedbyai.lol onto outbid.lol itself (this is the whole marketing plan)
- Submit to the usual directories
- Add a live visitor counter later if traction shows (datafa.st, same as outbid)

## Honesty rules baked in

- Footer says citations are not guaranteed
- All bids final, illegal/deceptive/NSFW listings removed without refund
- Keep it that way

## Moderation

No admin UI in v1. Remove a bad listing directly in Supabase:
`delete from listings where domain = 'bad.com';`
