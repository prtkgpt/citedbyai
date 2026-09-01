import { getListings, getLastCrawlerVisit } from "@/lib/supabase";
import BidForm from "@/components/BidForm";
import Board from "@/components/Board";
import CrawlerLog from "@/components/CrawlerLog";
import SuccessBanner from "@/components/SuccessBanner";

export const revalidate = 60;

export default async function Home() {
  const listings = await getListings();
  const lastVisit = await getLastCrawlerVisit();
  const top3 = listings.slice(0, 3);
  const totalUsd = Math.round(listings.reduce((a, l) => a + l.total_cents, 0) / 100);
  const totalBids = listings.reduce((a, l) => a + l.bid_count, 0);
  const recent = [...listings]
    .sort((a, b) => +new Date(b.last_bid_at) - +new Date(a.last_bid_at))
    .slice(0, 5);
  const agoStr = (iso: string) => {
    const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 3600) return `${Math.max(1, Math.floor(sec / 60))}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  };
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
        <SuccessBanner />
        <header className="site">
          <a className="logo" href="/">citedbyai<span>.lol</span></a>
        </header>

        <section className="hero">
          <div className="pill">
            <span className="dot" />
            ${totalUsd.toLocaleString()} on the board · {totalBids} bid{totalBids === 1 ? "" : "s"} ·{" "}
            {lastVisit ? `${lastVisit.bot} seen ${agoStr(lastVisit.visited_at)}` : "awaiting first AI crawler"}
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

        {recent.length > 0 && (
          <section className="activity">
            <h2>Latest activity</h2>
            <ul>
              {recent.map((l) => (
                <li key={l.id}>
                  <a href={`/site/${l.domain}`}>{l.domain}</a>
                  <span>${(l.total_cents / 100).toLocaleString()} total · {agoStr(l.last_bid_at)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

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
