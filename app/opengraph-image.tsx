import { ImageResponse } from "next/og";
import { getListings } from "@/lib/supabase";

export const runtime = "edge";
export const alt = "citedbyai.lol — the leaderboard AI models read";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  let top: { domain: string; total_cents: number }[] = [];
  try {
    top = (await getListings()).slice(0, 3);
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#faf8f4",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#1d1c19" }}>
          citedbyai<span style={{ color: "#4056d6" }}>.lol</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            color: "#1d1c19",
            marginTop: 28,
            lineHeight: 1.05,
          }}
        >
          The leaderboard
        </div>
        <div style={{ display: "flex", marginTop: 6 }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 800,
              background: "#ffd766",
              color: "#1d1c19",
              padding: "0 18px",
              borderRadius: 14,
            }}
          >
            AI models read
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 44, gap: 14 }}>
          {top.map((l, i) => (
            <div
              key={l.domain}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: i === 0 ? "#fff3cf" : "#ffffff",
                border: "3px solid " + (i === 0 ? "#ffd766" : "#e9e6de"),
                borderRadius: 18,
                padding: "16px 28px",
                fontSize: 34,
                color: "#1d1c19",
              }}
            >
              <span style={{ fontWeight: 700 }}>
                #{i + 1}  {l.domain}
              </span>
              <span style={{ fontWeight: 800, color: "#4056d6" }}>
                ${Math.round(l.total_cents / 100).toLocaleString()}
              </span>
            </div>
          ))}
          {top.length === 0 && (
            <div style={{ display: "flex", fontSize: 36, color: "#6f6d66" }}>
              Spots start at $5. First bid takes #1.
            </div>
          )}
        </div>
      </div>
    ),
    size
  );
}
