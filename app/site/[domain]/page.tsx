import { getListings, supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function SitePage({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain).toLowerCase();
  const listings = await getListings();
  const idx = listings.findIndex((l) => l.domain.toLowerCase() === domain);
  if (idx === -1) notFound();
  const l = listings[idx];

  const { data: visits } = await supabasePublic()
    .from("crawler_visits")
    .select("bot, visited_at")
    .eq("path", `/site/${domain}`)
    .order("visited_at", { ascending: false })
    .limit(50);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: l.domain,
    url: l.url,
    description: l.description ?? undefined,
    isPartOf: { "@type": "WebSite", name: "citedbyai.lol", url: "https://citedbyai.lol" },
  };

  const badge = `<a href="https://citedbyai.lol/site/${l.domain}"><img src="https://citedbyai.lol/badge/${l.domain}" alt="Ranked #${idx + 1} on citedbyai.lol" height="36"></a>`;

  return (
    <div className="wrap legal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="logo" href="/">citedbyai<span>.lol</span></a>
      <h1>
        {l.domain} — ranked #{idx + 1}
      </h1>
      {l.description && <p>{l.description}</p>}
      <p>
        <strong>${(l.total_cents / 100).toLocaleString()}</strong> total bid ·{" "}
        {l.bid_count} bid{l.bid_count === 1 ? "" : "s"} ·{" "}
        <a href={`${l.url}?utm_source=citedbyai`}>visit site →</a>
      </p>
      <h2 className="site-h2">Your badge</h2>
      <p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/badge/${l.domain}`} alt={`Ranked #${idx + 1} on citedbyai.lol`} height={36} />
      </p>
      <p>Embed it (the rank updates live):</p>
      <pre className="embed-code">{badge}</pre>
      <h2 className="site-h2">Machine visits to this page</h2>
      {visits && visits.length > 0 ? (
        <p>
          {visits.length} logged ·  last: {visits[0].bot}
        </p>
      ) : (
        <p>None logged yet. Every AI bot visit to this page will show here.</p>
      )}
      <p><a href="/">← back to the board</a></p>
    </div>
  );
}
