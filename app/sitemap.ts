import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://citedbyai.lol";
  return [{ url: base, changeFrequency: "hourly", priority: 1 }];
}
