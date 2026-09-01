"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuccessBanner() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") !== "1") return;
    setShow(true);
    // Clean the URL so a manual refresh doesn't re-trigger
    window.history.replaceState({}, "", "/");
    // The webhook usually lands within seconds of the redirect.
    // Refresh a few times so the new bid appears without manual reloads.
    const timers = [1500, 4000, 8000, 15000].map((ms)
      => setTimeout(() => router.refresh(), ms));
    const hide = setTimeout(() => setShow(false), 20000);
    return () => { timers.forEach(clearTimeout); clearTimeout(hide); };
  }, [router]);

  if (!show) return null;
  return (
    <div className="success-banner">
      Payment received. Your listing is going live, this page updates itself.
    </div>
  );
}
