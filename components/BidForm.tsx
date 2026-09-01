"use client";

import { useMemo, useState } from "react";

type Totals = { url: string; total_cents: number }[];

export default function BidForm({ totals }: { totals: Totals }) {
  const [url, setUrl] = useState("");
  const [amount, setAmount] = useState("25");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const amt = Math.floor(Number(amount) || 0);

  const projected = useMemo(() => {
    let host = "";
    try {
      host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
        .replace(/^www\./, "")
        .toLowerCase();
    } catch {
      return null;
    }
    if (!host) return null;
    const existing = totals.find((t) => {
      try {
        return (
          new URL(t.url).hostname.replace(/^www\./, "").toLowerCase() === host
        );
      } catch {
        return false;
      }
    });
    const newTotal = (existing?.total_cents ?? 0) + amt * 100;
    const rank =
      1 +
      totals.filter(
        (t) => t.url !== (existing?.url ?? "") && t.total_cents >= newTotal
      ).length;
    return { rank, newTotal, stacking: !!existing };
  }, [url, amt, totals]);

  function openConfirm() {
    setErr("");
    if (!url.trim()) return setErr("Enter your URL first.");
    if (!projected) return setErr("That URL doesn't look valid.");
    if (amt < 5) return setErr("Minimum bid is $5.");
    setAgreed(false);
    setConfirming(true);
  }

  async function checkout() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, amountUsd: amount, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div className="bid-form">
      <input
        placeholder="yourproduct.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label="Your URL"
      />
      <textarea
        placeholder="One sentence about your product. This is the text crawlers read."
        rows={2}
        maxLength={200}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="Description"
      />
      <div className="bid-row">
        <input
          type="number"
          min={5}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Bid in dollars"
        />
        <button onClick={openConfirm} disabled={busy}>
          Outbid them
        </button>
      </div>
      {err && <span className="err">{err}</span>}
      <span className="fine">
        Bids on the same URL stack. Rank = total paid. All bids final.
      </span>

      {confirming && projected && (
        <div className="modal-overlay" onClick={() => !busy && setConfirming(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-x"
              onClick={() => setConfirming(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Confirm this rank</h3>
            <p className="modal-sub">
              Check the rank and price, then agree to the terms to continue.
            </p>
            <div className="rank-box">
              <div>
                <span className="rank-label">Rank</span>
                <span className="rank-big">#{projected.rank}</span>
                <span className="rank-note">
                  {projected.stacking ? "added to your total" : "new listing"}
                </span>
              </div>
              <div className="rank-right">
                <span className="rank-label">Price</span>
                <span className="rank-big">${amt.toLocaleString()}</span>
                <span className="rank-note">due now</span>
              </div>
            </div>
            <p className="modal-note">
              Your listing goes live when payment confirms. Anyone can outbid
              you at any time. All bids are final.
            </p>
            <label className="agree">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I have read and agree to the{" "}
                <a href="/terms" target="_blank">Terms of Service</a> of
                citedbyai.lol
              </span>
            </label>
            <p className="modal-links">
              <a href="/privacy" target="_blank">Privacy</a> ·{" "}
              <a href="/rules" target="_blank">Rules</a>
            </p>
            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => setConfirming(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={checkout}
                disabled={!agreed || busy}
              >
                {busy ? "Opening checkout…" : "Continue to checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
