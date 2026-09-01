import { getListings } from "@/lib/supabase";
import BidForm from "@/components/BidForm";
import Board from "@/components/Board";
import CrawlerLog from "@/components/CrawlerLog";

export const revalidate = 60;

export default async function Home() {
  const listings = await getListings();
  const top3 = listings.slice(0, 3);
  const takePrice = listings.length
    ? Math.ceil(listings[0].total_cents / 100) + 1
    : 5;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "citedbyai.lol ranked directory",
    description:
      "A public, ranked directory of products and websites. Rankings are set by open bidding.",
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: l.url,
      name: l.domain,
      description: l.description ?? undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="wrap">
        <header className="site">
          <a className="logo" href="/">citedbyai<span>.lol</span></a>
        </header>

        <section className="hero">
          <div className="pill">
            <span className="dot" />crawled by GPTBot · ClaudeBot · PerplexityBot
          </div>
          <h1>
            The leaderboard <span className="hl">AI models read</span>
          </h1>
          <p className="sub">
            Clean HTML, JSON-LD, and a live llms.txt. Every listing is served
            to AI crawlers. Your rank is set by open bidding.
          </p>
          <div className="take">
            Take #1 for <b>${takePrice.toLocaleString()}</b> · spots start at $5
          </div>

          <BidForm totals={listings.map((l) => ({ url: l.url, total_cents: l.total_cents }))} />

          <div className="answer-card">
            <div className="prompt">what an AI answer with citations looks like</div>
            <span>
              There are several tools worth considering for this
              {top3.map((l, i) => (
                <a key={l.id} className="cite-chip" href={l.url}>
                  {i + 1} {l.domain}
                </a>
              ))}
              {top3.length === 0 && (
                <a className="cite-chip" href="#bid">your product here</a>
              )}
              . Rankings on public directories are one signal among many.
            </span>
          </div>
        </section>

        <Board listings={listings} />

        <CrawlerLog />

        <footer className="site">
          We make this page maximally readable by AI crawlers. We can&apos;t
          guarantee any model will cite you. All bids final. Illegal,
          deceptive, or NSFW listings removed without refund. ·{" "}
          <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> ·{" "}
          <a href="/rules">Rules</a> · <a href="/llms.txt">llms.txt</a>
        </footer>
      </div>
    </>
  );
}
