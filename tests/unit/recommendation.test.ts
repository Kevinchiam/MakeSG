import { describe, expect, it } from "vitest";
import { businesses, projects } from "@/lib/data";
import { getRecommendations, recommendServiceSlugs, scoreBusiness } from "@/lib/recommendation";

describe("recommendation engine", () => {
  it("maps keywords to service categories", () => {
    const services = recommendServiceSlugs({
      title: "Interactive aluminium prototype",
      description: "A sensor-driven aluminium object for an exhibition.",
      materials: ["aluminium"],
      knownServices: [],
    });

    expect(services).toContain("metal-fabrication");
    expect(services).toContain("cnc-machining");
    expect(services).toContain("creative-technology");
  });

  it("scores exact service and material matches higher", () => {
    const project = projects[0];
    const metalBusiness = businesses.find((business) => business.slug === "kaki-bukit-precision-works")!;
    const score = scoreBusiness(project, metalBusiness);

    expect(score.score).toBeGreaterThan(10);
    expect(score.matchedServices).toContain("cnc-machining");
    expect(score.matchedMaterials).toContain("aluminium");
  });

  it("sorts best recommendations first", () => {
    const [first] = getRecommendations(projects[0]);
    expect(first.business.slug).toBe("kaki-bukit-precision-works");
  });
});
