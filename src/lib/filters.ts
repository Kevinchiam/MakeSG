import { services } from "@/lib/data";
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

  const filtered = businesses.filter((business) => {
    if (business.publicationStatus !== "published") return false;
    if (text && scoreBusinessSearchMatch(business, text) <= 0) return false;
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

  if (!text) return filtered;

  return [...filtered].sort((a, b) => scoreBusinessSearchMatch(b, text) - scoreBusinessSearchMatch(a, text));
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

function scoreBusinessSearchMatch(business: Business, query: string) {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return 0;

  const text = searchableBusinessText(business);
  const words = tokenize(text);
  const textBlob = ` ${text.toLowerCase()} `;
  let score = 0;

  for (const term of queryTerms) {
    if (textBlob.includes(` ${term} `)) {
      score += 8;
      continue;
    }

    if (textBlob.includes(term)) {
      score += 5;
      continue;
    }

    const closest = words.some((word) => areCloseWords(term, word));
    if (closest) score += 3;
  }

  return score;
}

function searchableBusinessText(business: Business) {
  const serviceText = business.services
    .map((slug) => {
      const service = services.find((item) => item.slug === slug);
      return service ? `${service.name} ${service.description} ${service.group}` : slug;
    })
    .join(" ");

  const portfolioText = business.portfolio
    .map((item) => `${item.title} ${item.description} ${item.tags.join(" ")}`)
    .join(" ");

  return [
    business.name,
    business.shortDescription,
    business.description,
    business.location,
    business.address,
    business.businessType,
    serviceText,
    business.materials.join(" "),
    business.processes.join(" "),
    business.projectTypes.join(" "),
    portfolioText,
  ].join(" ");
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !searchStopWords.has(term));
}

function areCloseWords(queryTerm: string, word: string) {
  if (Math.abs(queryTerm.length - word.length) > 2) return false;
  const threshold = queryTerm.length <= 5 ? 1 : 2;
  return levenshteinDistance(queryTerm, word) <= threshold;
}

function levenshteinDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

const searchStopWords = new Set(["a", "an", "and", "are", "for", "in", "of", "or", "the", "to", "with"]);
