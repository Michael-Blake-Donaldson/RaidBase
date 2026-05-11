import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/lib/site-config";

describe("metadata routes", () => {
  it("returns robots rules that disallow admin and settings surfaces", () => {
    const result = robots();

    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
    expect(result.rules).toEqual([
      expect.objectContaining({
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/settings", "/api/admin"],
      }),
    ]);
  });

  it("includes legal and security routes in sitemap", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain(`${siteConfig.url}/privacy`);
    expect(urls).toContain(`${siteConfig.url}/terms`);
    expect(urls).toContain(`${siteConfig.url}/community-guidelines`);
    expect(urls).toContain(`${siteConfig.url}/support`);
    expect(urls).toContain(`${siteConfig.url}/settings/security`);
  });

  it("returns a valid manifest config", () => {
    const result = manifest();

    expect(result.name).toBe(siteConfig.name);
    expect(result.start_url).toBe("/");
    expect(result.icons?.length).toBeGreaterThan(0);
  });
});
