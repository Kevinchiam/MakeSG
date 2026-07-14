import { businesses } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicationStatus, VerificationStatus } from "@/lib/types";

export type AdminBusinessSummary = {
  id: string;
  name: string;
  shortDescription: string;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  source: "supabase" | "demo";
  endorsementCount: number;
};

type BusinessRow = {
  id: string;
  name: string;
  slug?: string;
  short_description: string;
  description?: string;
  website_url?: string | null;
  public_email?: string | null;
  address?: string | null;
  minimum_budget?: number | null;
  typical_lead_time?: number | null;
  business_type?: string | null;
  publication_status: PublicationStatus;
  verification_status: VerificationStatus;
  endorsement_count?: number | null;
  business_services?: { services: { name: string; slug: string } | { name: string; slug: string }[] | null }[];
  portfolio_items?: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    tags: string[] | null;
  }[];
};

export type ExistingBusinessSuggestion = {
  id: string;
  name: string;
  slug: string;
  publicationStatus: PublicationStatus;
  endorsementCount: number;
  source: "supabase" | "demo";
};

export async function getAdminBusinesses(): Promise<AdminBusinessSummary[]> {
  const demoBusinesses = businesses.map((business) => ({
    id: business.id,
    name: business.name,
    shortDescription: business.shortDescription,
    publicationStatus: business.publicationStatus,
    verificationStatus: business.verificationStatus,
    endorsementCount: business.endorsementCount,
    source: "demo" as const,
  }));

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, publication_status, verification_status, endorsement_count")
      .order("created_at", { ascending: false });

    const submittedBusinesses = ((data ?? []) as BusinessRow[]).map((business) => ({
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
      publicationStatus: business.publication_status,
      verificationStatus: business.verification_status,
      endorsementCount: business.endorsement_count ?? 0,
      source: "supabase" as const,
    }));

    return [...submittedBusinesses, ...demoBusinesses];
  } catch {
    return demoBusinesses;
  }
}

export async function getAdminBusiness(id: string) {
  const demoBusiness = businesses.find((business) => business.id === id);

  if (demoBusiness) {
    return {
      id: demoBusiness.id,
      name: demoBusiness.name,
      shortDescription: demoBusiness.shortDescription,
      description: demoBusiness.description,
      websiteUrl: demoBusiness.websiteUrl,
      publicEmail: demoBusiness.publicEmail,
      location: demoBusiness.location,
      minimumBudget: demoBusiness.minimumBudget,
      typicalLeadTime: demoBusiness.typicalLeadTime,
      businessType: demoBusiness.businessType,
      services: demoBusiness.services,
      portfolio: demoBusiness.portfolio,
      publicationStatus: demoBusiness.publicationStatus,
      endorsementCount: demoBusiness.endorsementCount,
      source: "demo" as const,
    };
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, description, website_url, public_email, address, minimum_budget, typical_lead_time, business_type, publication_status, endorsement_count, business_services(services(name, slug)), portfolio_items(id, title, description, image_url, tags)")
      .eq("id", id)
      .single();

    if (!data) return null;

    const business = data as unknown as BusinessRow;
    return {
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
      description: business.description ?? "",
      websiteUrl: business.website_url ?? "",
      publicEmail: business.public_email ?? "",
      location: business.address ?? "Singapore",
      minimumBudget: business.minimum_budget ?? 0,
      typicalLeadTime: business.typical_lead_time ?? 0,
      businessType: business.business_type ?? "studio",
      services: business.business_services?.flatMap((join) => {
        if (!join.services) return [];
        if (Array.isArray(join.services)) return join.services.map((service) => service.name);
        return [join.services.name];
      }) ?? [],
      portfolio: business.portfolio_items?.filter((item) => Boolean(item.image_url)).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        imageUrl: item.image_url ?? "",
        tags: item.tags ?? [],
      })) ?? [],
      publicationStatus: business.publication_status,
      endorsementCount: business.endorsement_count ?? 0,
      source: "supabase" as const,
    };
  } catch {
    return null;
  }
}

export async function getExistingBusinessSuggestions(): Promise<ExistingBusinessSuggestion[]> {
  const demoSuggestions = businesses.map((business) => ({
    id: business.id,
    name: business.name,
    slug: business.slug,
    publicationStatus: business.publicationStatus,
    endorsementCount: business.endorsementCount,
    source: "demo" as const,
  }));

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, slug, publication_status, endorsement_count")
      .order("created_at", { ascending: false });

    if (error) return demoSuggestions;

    const submittedSuggestions = ((data ?? []) as BusinessRow[]).map((business) => ({
      id: business.id,
      name: business.name,
      slug: business.slug ?? business.id,
      publicationStatus: business.publication_status,
      endorsementCount: business.endorsement_count ?? 0,
      source: "supabase" as const,
    }));

    return [...submittedSuggestions, ...demoSuggestions];
  } catch {
    return demoSuggestions;
  }
}
