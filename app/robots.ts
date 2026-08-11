import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://docgen.mipdevp.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/documents/", "/settings/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
