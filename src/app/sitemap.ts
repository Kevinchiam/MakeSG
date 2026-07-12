import type { MetadataRoute } from "next";
import { businesses, services } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/explore", "/services", "/businesses", "/projects/new", "/for-businesses", "/about", "/sign-in", "/sign-up"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...services.map((service) => ({ url: `${base}/services/${service.slug}`, lastModified: new Date() })),
    ...businesses.map((business) => ({ url: `${base}/businesses/${business.slug}`, lastModified: new Date() })),
  ];
}
