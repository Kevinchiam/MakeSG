import { businesses, services } from "@/lib/data";
import type { Business, Project } from "@/lib/types";

export const keywordServiceMap: Record<string, string[]> = {
  aluminium: ["metal-fabrication", "cnc-machining", "metal-finishing"],
  aluminum: ["metal-fabrication", "cnc-machining", "metal-finishing"],
  plywood: ["woodworking", "carpentry", "cnc-routing"],
  timber: ["woodworking", "carpentry", "cnc-routing"],
  prototype: ["3d-printing", "model-making", "product-design"],
  prototyping: ["3d-printing", "model-making", "product-design"],
  interactive: ["creative-technology", "electronics-prototyping"],
  sensor: ["creative-technology", "electronics-prototyping"],
  exhibition: ["event-fabrication", "installation", "signage"],
  packaging: ["packaging-design", "printing", "die-cutting"],
  ceramic: ["ceramics", "mould-making", "kiln-firing"],
  clay: ["ceramics", "mould-making", "kiln-firing"],
  fabric: ["textiles", "sewing", "soft-goods-prototyping"],
  textile: ["textiles", "sewing", "soft-goods-prototyping"],
};

export type BusinessScore = {
  business: Business;
  score: number;
  matchedServices: string[];
  matchedMaterials: string[];
  matchedPortfolioTags: string[];
  reasons: string[];
};

export function recommendServiceSlugs(project: Pick<Project, "description" | "title" | "materials" | "knownServices">) {
  const source = `${project.title} ${project.description} ${project.materials.join(" ")} ${project.knownServices.join(" ")}`.toLowerCase();
  const matches = new Set(project.knownServices);

  for (const [keyword, mappedServices] of Object.entries(keywordServiceMap)) {
    if (source.includes(keyword)) {
      mappedServices.forEach((service) => matches.add(service));
    }
  }

  return Array.from(matches).filter((slug) => services.some((service) => service.slug === slug));
}

export function scoreBusiness(project: Project, business: Business, recommendedServices = recommendServiceSlugs(project)): BusinessScore {
  const matchedServices = business.services.filter((service) => recommendedServices.includes(service));
  const matchedMaterials = business.materials.filter((material) => project.materials.includes(material));
  const portfolioTags = new Set(business.portfolio.flatMap((item) => item.tags));
  const matchedPortfolioTags = [...portfolioTags].filter((tag) => [...recommendedServices, ...project.materials].includes(tag));
  const scaleCompatible =
    project.prototypeOrProduction === "both" ||
    (project.prototypeOrProduction === "prototype" && business.acceptsPrototypes) ||
    (project.prototypeOrProduction === "production" && business.acceptsProduction);
  const budgetCompatible = project.budgetMax ? business.minimumBudget <= project.budgetMax : true;
  const locationCompatible = project.preferredLocation ? business.location === project.preferredLocation : false;

  const score =
    matchedServices.length * 5 +
    matchedMaterials.length * 3 +
    (scaleCompatible ? 2 : 0) +
    (budgetCompatible ? 2 : 0) +
    (locationCompatible ? 1 : 0) +
    matchedPortfolioTags.length;

  const reasons = [
    matchedServices.length
      ? `offers ${matchedServices.map(labelForService).join(", ")}`
      : "",
    matchedMaterials.length ? `works with ${matchedMaterials.join(", ")}` : "",
    scaleCompatible ? acceptsText(project.prototypeOrProduction) : "",
    budgetCompatible && project.budgetMax ? `can start within the stated budget range` : "",
    locationCompatible ? `is located in ${business.location}` : "",
  ].filter(Boolean);

  return { business, score, matchedServices, matchedMaterials, matchedPortfolioTags, reasons };
}

export function getRecommendations(project: Project, candidates = businesses) {
  const recommendedServices = recommendServiceSlugs(project);

  return candidates
    .map((business) => scoreBusiness(project, business, recommendedServices))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function recommendationSentence(score: BusinessScore) {
  if (!score.reasons.length) return "Recommended because this business has adjacent capabilities for the brief.";
  return `Recommended because this business ${score.reasons.join(", ")}.`;
}

function labelForService(slug: string) {
  return services.find((service) => service.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

function acceptsText(mode: Project["prototypeOrProduction"]) {
  if (mode === "prototype") return "accepts one-off prototypes";
  if (mode === "production") return "accepts production work";
  return "accepts both prototypes and production work";
}
