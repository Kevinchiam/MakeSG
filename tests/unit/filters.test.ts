import { describe, expect, it } from "vitest";
import { filterBusinesses } from "@/lib/filters";
import type { Business } from "@/lib/types";

const businesses: Business[] = [
  {
    id: "biz_woodlands_mould",
    name: "Woodlands Mould Collective",
    slug: "woodlands-mould-collective",
    shortDescription: "Silicone mould making for toys, product prototypes and small parts.",
    description: "A workshop focused on silicone casting, resin samples and playful product prototypes.",
    websiteUrl: "",
    publicEmail: "",
    location: "Woodlands",
    showFullAddress: false,
    minimumBudget: 300,
    typicalLeadTime: 14,
    businessType: "workshop",
    acceptsPrototypes: true,
    acceptsProduction: true,
    offersOnsiteService: false,
    offersRemoteService: true,
    verificationStatus: "unverified",
    publicationStatus: "published",
    featured: false,
    claimed: false,
    endorsementCount: 0,
    recommendationCount: 1,
    services: ["mould-making"],
    materials: ["silicone", "resin"],
    processes: ["casting"],
    projectTypes: ["prototype", "small-batch"],
    portfolio: [
      {
        id: "portfolio_silicone_toy",
        title: "Silicone toy mould",
        description: "Flexible silicone mould for a small toy prototype.",
        tags: ["silicone", "toy", "mould-making"],
        imageUrl: "/demo/woodlands-mould.svg",
      },
    ],
    heroImage: "/demo/woodlands-mould.svg",
  },
];

describe("business filters", () => {
  it("finds relevant listings from partial query terms", () => {
    const results = filterBusinesses(businesses, { q: "silicone toy" });

    expect(results.map((business) => business.slug)).toContain("woodlands-mould-collective");
  });

  it("tolerates small search typos", () => {
    const results = filterBusinesses(businesses, { q: "sillicone" });

    expect(results[0]?.slug).toBe("woodlands-mould-collective");
  });
});
