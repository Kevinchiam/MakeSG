import type { MetadataRoute } from "next";
import { businesses } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/businesses", "/recommend-business", "/creative-jobs", "/for-creatives", "/for-businesses", "/about"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...businesses.map((business) => ({ url: `${base}/businesses/${business.slug}`, lastModified: new Date() })),
  ];
}
