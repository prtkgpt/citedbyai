import { supabasePublic } from "@/lib/supabase";

type Visit = { bot: string; visited_at: string };

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function CrawlerLog() {
  const { data } = await supabasePublic()
    .from("crawler_visits")
    .select("bot, visited_at")
    .order("visited_at", { ascending: false })
    .limit(500);

  const visits = (data ?? []) as Visit[];
  const byBot = new Map<string, { count: number; last: string }>();
  for (const v of visits) {
    const cur = byBot.get(v.bot);
    if (cur) cur.count += 1;
    else byBot.set(v.bot, { count: 1, last: v.visited_at });
  }
  const rows = [...byBot.entries()].sort((a, b) => b[1].count - a[1].count);

  return (
    <section className="crawler-log">
      <h2>Machine visitors</h2>
      {rows.length === 0 ? (
        <p className="log-empty">
          No AI crawlers logged yet. They typically discover new sites within
          days. Every visit will show here, publicly.
        </p>
      ) : (
        <ul>
          {rows.map(([bot, s]) => (
            <li key={bot}>
              <span className="bot-name">{bot}</span>
              <span className="bot-stats">
                {s.count} visit{s.count === 1 ? "" : "s"} · last {ago(s.last)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
