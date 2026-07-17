import { describe, expect, it } from "vitest";
import { businesses } from "@/lib/data";
import { filterBusinesses } from "@/lib/filters";

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
