"use client";

import { useState } from "react";

export default function BidForm() {
  const [url, setUrl] = useState("");
  const [amount, setAmount] = useState("25");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
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
        <button onClick={submit} disabled={busy}>
          {busy ? "Opening checkout…" : "Outbid them"}
        </button>
      </div>
      {err && <span className="err">{err}</span>}
      <span className="fine">
        Bids on the same URL stack. Rank = total paid. All bids final.
      </span>
    </div>
  );
}
