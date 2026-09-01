"use client";

import { useState } from "react";
import type { Listing } from "@/lib/supabase";

export default function Board({ listings }: { listings: Listing[] }) {
  const [view, setView] = useState<"human" | "machine">("human");

  const machineText = [
    "# citedbyai.lol ranked directory",
    "",
    ...listings.map(
      (l, i) =>
        `${i + 1}. [${l.domain}](${l.url})${l.description ? `: ${l.description}` : ""}`
    ),
  ].join("\n");

  return (
    <section>
      <div className="board-head">
        <h2>The board</h2>
        <div className="view-toggle" role="tablist" aria-label="View mode">
          <button className={view === "human" ? "on" : ""} onClick={() => setView("human")}>
            human view
          </button>
          <button className={view === "machine" ? "on" : ""} onClick={() => setView("machine")}>
            what crawlers see
          </button>
        </div>
      </div>

      {view === "human" ? (
        <ol className="bib">
          {listings.map((l, i) => (
            <li key={l.id} className={i === 0 ? "top1" : ""}>
              <span className="rank">#{i + 1}</span>
              <span className="entry">
                <a className="dom" href={`${l.url}?utm_source=citedby`} rel="noopener">
                  {l.domain}
                </a>
                {l.description && <p>{l.description}</p>}
                <a className="stats-link" href={`/site/${l.domain}`}>stats + badge →</a>
              </span>
              <span className="amount">${(l.total_cents / 100).toLocaleString()}</span>
            </li>
          ))}
          {listings.length === 0 && (
            <li>
              <span className="rank">#1</span>
              <span className="entry">
                <span className="dom">This spot is empty.</span>
                <p>First bid takes #1 for $5. That will not last.</p>
              </span>
            </li>
          )}
        </ol>
      ) : (
        <pre className="machine">{machineText}</pre>
      )}
    </section>
  );
}
