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
  publication_status: PublicationStatus;
  verification_status: VerificationStatus;
  endorsement_count?: number | null;
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
      publicationStatus: demoBusiness.publicationStatus,
      endorsementCount: demoBusiness.endorsementCount,
      source: "demo" as const,
    };
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, publication_status, endorsement_count")
      .eq("id", id)
      .single();

    if (!data) return null;

    const business = data as Pick<BusinessRow, "id" | "name" | "short_description" | "publication_status" | "endorsement_count">;
    return {
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
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
