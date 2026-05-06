import type { MetadataRoute } from "next";

import { recommendedPlayers } from "@/lib/site-data";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = siteConfig.routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  const profileRoutes = recommendedPlayers.map((player) => ({
    url: `${siteConfig.url}/profile/${player.username}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...profileRoutes];
}