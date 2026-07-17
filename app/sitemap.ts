import type { MetadataRoute } from "next";
import { products, posts } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    "", "/shop", "/about", "/contact", "/blog", "/privacy", "/cart", "/checkout",
    ...products.map((p) => `/product/${p.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
