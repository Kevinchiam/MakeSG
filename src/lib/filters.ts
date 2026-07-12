import type { Business, BusinessFilters } from "@/lib/types";

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): BusinessFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    q: get("q") || undefined,
    service: get("service") || undefined,
    material: get("material") || undefined,
    location: get("location") || undefined,
    mode: asMode(get("mode")),
    minBudget: get("minBudget") ? Number(get("minBudget")) : undefined,
    leadTime: get("leadTime") ? Number(get("leadTime")) : undefined,
    businessType: asBusinessType(get("businessType")),
    delivery: asDelivery(get("delivery")),
    verified: get("verified") === "true" ? true : undefined,
  };
}

export function filterBusinesses(businesses: Business[], filters: BusinessFilters) {
  const text = filters.q?.toLowerCase().trim();

  return businesses.filter((business) => {
    if (business.publicationStatus !== "published") return false;
    if (text) {
      const haystack = [
        business.name,
        business.shortDescription,
        business.description,
        business.location,
        business.services.join(" "),
        business.materials.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    if (filters.service && !business.services.includes(filters.service)) return false;
    if (filters.material && !business.materials.includes(filters.material)) return false;
    if (filters.location && business.location !== filters.location) return false;
    if (filters.mode === "prototype" && !business.acceptsPrototypes) return false;
    if (filters.mode === "production" && !business.acceptsProduction) return false;
    if (filters.minBudget && business.minimumBudget > filters.minBudget) return false;
    if (filters.leadTime && business.typicalLeadTime > filters.leadTime) return false;
    if (filters.businessType && business.businessType !== filters.businessType) return false;
    if (filters.delivery === "onsite" && !business.offersOnsiteService) return false;
    if (filters.delivery === "remote" && !business.offersRemoteService) return false;
    if (filters.verified && business.verificationStatus !== "verified") return false;
    return true;
  });
}

export function toQueryString(filters: BusinessFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== false) params.set(key, String(value));
  });
  return params.toString();
}

function asMode(value?: string): BusinessFilters["mode"] {
  return value === "prototype" || value === "production" ? value : undefined;
}

function asDelivery(value?: string): BusinessFilters["delivery"] {
  return value === "onsite" || value === "remote" ? value : undefined;
}

function asBusinessType(value?: string): BusinessFilters["businessType"] {
  const allowed = ["independent", "studio", "workshop", "consultancy", "manufacturer", "supplier"];
  return allowed.includes(value ?? "") ? (value as BusinessFilters["businessType"]) : undefined;
}
