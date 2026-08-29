import { describe, expect, it } from "vitest";
import { getRecommendations, recommendServiceSlugs, scoreBusiness } from "@/lib/recommendation";
import type { Business, Project } from "@/lib/types";

const aluminiumProject: Project = {
  id: "project_aluminium_lamp",
  ownerId: "test_creative",
  title: "Aluminium table lamp prototype",
  description: "A one-off aluminium lamp with machined hinge details and a warm dimmable LED.",
  intendedOutcome: "Working prototype for photography and investor conversations.",
  projectType: "physical",
  quantity: "1",
  materials: ["aluminium", "electronics"],
  knownServices: ["cnc-machining", "electronics-prototyping"],
  prototypeOrProduction: "prototype",
  preferredLocation: "Ubi",
  budgetMin: 2500,
  budgetMax: 7000,
  status: "draft",
};

const businesses: Business[] = [
  {
    id: "biz_kaki_bukit",
    name: "Kaki Bukit Precision Works",
    slug: "kaki-bukit-precision-works",
    shortDescription: "Precision machining for aluminium prototypes.",
    description: "CNC machining and metal finishing for aluminium product prototypes.",
    websiteUrl: "",
    publicEmail: "",
    location: "Ubi",
    showFullAddress: false,
    minimumBudget: 1200,
    typicalLeadTime: 10,
    businessType: "workshop",
    acceptsPrototypes: true,
    acceptsProduction: true,
    offersOnsiteService: true,
    offersRemoteService: false,
    verificationStatus: "unverified",
    publicationStatus: "published",
    featured: false,
    claimed: false,
    endorsementCount: 0,
    recommendationCount: 1,
    services: ["cnc-machining", "metal-fabrication", "metal-finishing"],
    materials: ["aluminium", "mild steel"],
    processes: ["milling"],
    projectTypes: ["prototype", "small-batch"],
    portfolio: [
      {
        id: "portfolio_aluminium_hinge",
        title: "Aluminium hinge prototype",
        description: "Machined aluminium hinge detail for a lamp prototype.",
        tags: ["aluminium", "cnc-machining"],
        imageUrl: "/demo/kaki-bukit.svg",
      },
    ],
    heroImage: "/demo/kaki-bukit.svg",
  },
  {
    id: "biz_print",
    name: "Print Sample Studio",
    slug: "print-sample-studio",
    shortDescription: "Packaging and print sampling.",
    description: "Paper packaging prototypes and short-run print finishing.",
    websiteUrl: "",
    publicEmail: "",
    location: "Queenstown",
    showFullAddress: false,
    minimumBudget: 800,
    typicalLeadTime: 7,
    businessType: "studio",
    acceptsPrototypes: true,
    acceptsProduction: true,
    offersOnsiteService: false,
    offersRemoteService: true,
    verificationStatus: "unverified",
    publicationStatus: "published",
    featured: false,
    claimed: false,
    endorsementCount: 0,
    recommendationCount: 0,
    services: ["packaging-design", "printing"],
    materials: ["paper"],
    processes: ["printing"],
    projectTypes: ["prototype"],
    portfolio: [],
    heroImage: "/demo/print.svg",
  },
];

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
    const metalBusiness = businesses.find((business) => business.slug === "kaki-bukit-precision-works")!;
    const score = scoreBusiness(aluminiumProject, metalBusiness);

    expect(score.score).toBeGreaterThan(10);
    expect(score.matchedServices).toContain("cnc-machining");
    expect(score.matchedMaterials).toContain("aluminium");
  });

  it("sorts best recommendations first", () => {
    const [first] = getRecommendations(aluminiumProject, businesses);
    expect(first.business.slug).toBe("kaki-bukit-precision-works");
  });
});
