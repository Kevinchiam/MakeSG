import { businesses as demoBusinesses } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Business, BusinessType, PublicationStatus, VerificationStatus } from "@/lib/types";

type PublishedBusinessRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  website_url: string | null;
  public_email: string | null;
  public_phone: string | null;
  address: string | null;
  minimum_budget: number | null;
  typical_lead_time: number | null;
  business_type: BusinessType;
  accepts_prototypes: boolean;
  accepts_production: boolean;
  offers_onsite_service: boolean;
  offers_remote_service: boolean;
  verification_status: VerificationStatus;
  publication_status: PublicationStatus;
  featured: boolean;
  claimed: boolean;
  endorsement_count?: number | null;
  hero_image_url: string | null;
  updated_at?: string | null;
  business_services?: { services: { slug: string } | { slug: string }[] | null }[];
  portfolio_items?: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    tags: string[] | null;
  }[];
};

const fallbackImage = "/demo/bukit-merah-photo.svg";

export async function getPublishedBusinesses(): Promise<Business[]> {
  const publishedDemoBusinesses = demoBusinesses.filter((business) => business.publicationStatus === "published");

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, short_description, description, website_url, public_email, public_phone, address, minimum_budget, typical_lead_time, business_type, accepts_prototypes, accepts_production, offers_onsite_service, offers_remote_service, verification_status, publication_status, featured, claimed, endorsement_count, hero_image_url, updated_at, business_services(services(slug)), portfolio_items(id, title, description, image_url, tags)",
      )
      .eq("publication_status", "published")
      .order("updated_at", { ascending: false });

    if (error) return publishedDemoBusinesses;

    const submittedRows = (data ?? []) as unknown as PublishedBusinessRow[];
    const recommendationCounts = await approvedRecommendationCounts(submittedRows.map((business) => business.id));
    const submittedBusinesses = submittedRows.map((row) => rowToBusiness(row, recommendationCounts.get(row.id) ?? 0));
    return [...submittedBusinesses, ...publishedDemoBusinesses];
  } catch {
    return publishedDemoBusinesses;
  }
}

export async function getPublishedBusinessBySlug(slug: string) {
  const demoBusiness = demoBusinesses.find((business) => business.slug === slug && business.publicationStatus === "published");
  if (demoBusiness) return demoBusiness;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, short_description, description, website_url, public_email, public_phone, address, minimum_budget, typical_lead_time, business_type, accepts_prototypes, accepts_production, offers_onsite_service, offers_remote_service, verification_status, publication_status, featured, claimed, endorsement_count, hero_image_url, updated_at, business_services(services(slug)), portfolio_items(id, title, description, image_url, tags)",
      )
      .eq("slug", slug)
      .eq("publication_status", "published")
      .single();

    if (error || !data) return null;
    const row = data as unknown as PublishedBusinessRow;
    const recommendationCounts = await approvedRecommendationCounts([row.id]);
    return rowToBusiness(row, recommendationCounts.get(row.id) ?? 0);
  } catch {
    return null;
  }
}

async function approvedRecommendationCounts(businessIds: string[]) {
  const counts = new Map<string, number>();
  if (!businessIds.length) return counts;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_recommendations")
      .select("business_id")
      .eq("status", "approved")
      .in("business_id", businessIds);

    if (error) return counts;

    for (const recommendation of (data ?? []) as Array<{ business_id: string }>) {
      counts.set(recommendation.business_id, (counts.get(recommendation.business_id) ?? 0) + 1);
    }
  } catch {
    return counts;
  }

  return counts;
}

function rowToBusiness(row: PublishedBusinessRow, recommendationCount = 0): Business {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    websiteUrl: row.website_url ?? "#",
    publicEmail: row.public_email ?? "",
    publicPhone: row.public_phone ?? undefined,
    location: row.address ?? "",
    address: row.address ?? undefined,
    showFullAddress: false,
    minimumBudget: row.minimum_budget ?? 0,
    typicalLeadTime: row.typical_lead_time ?? 0,
    businessType: row.business_type,
    acceptsPrototypes: row.accepts_prototypes,
    acceptsProduction: row.accepts_production,
    offersOnsiteService: row.offers_onsite_service,
    offersRemoteService: row.offers_remote_service,
    verificationStatus: row.verification_status,
    publicationStatus: row.publication_status,
    featured: row.featured,
    claimed: row.claimed,
    endorsementCount: row.endorsement_count ?? 0,
    recommendationCount,
    updatedAt: row.updated_at ?? undefined,
    services: row.business_services?.flatMap((join) => {
      if (!join.services) return [];
      if (Array.isArray(join.services)) return join.services.map((service) => service.slug);
      return [join.services.slug];
    }) ?? [],
    materials: [],
    processes: [],
    projectTypes: [],
    portfolio: row.portfolio_items?.filter((item) => Boolean(item.image_url)).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      tags: item.tags ?? [],
      imageUrl: item.image_url ?? "",
    })) ?? [],
    heroImage: row.hero_image_url ?? fallbackImage,
    demoNotice: "Listed business.",
  };
}
