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
};

type BusinessRow = {
  id: string;
  name: string;
  short_description: string;
  publication_status: PublicationStatus;
  verification_status: VerificationStatus;
};

export async function getAdminBusinesses(): Promise<AdminBusinessSummary[]> {
  const demoBusinesses = businesses.map((business) => ({
    id: business.id,
    name: business.name,
    shortDescription: business.shortDescription,
    publicationStatus: business.publicationStatus,
    verificationStatus: business.verificationStatus,
    source: "demo" as const,
  }));

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, publication_status, verification_status")
      .order("created_at", { ascending: false });

    const submittedBusinesses = ((data ?? []) as BusinessRow[]).map((business) => ({
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
      publicationStatus: business.publication_status,
      verificationStatus: business.verification_status,
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
      source: "demo" as const,
    };
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, publication_status")
      .eq("id", id)
      .single();

    if (!data) return null;

    const business = data as Pick<BusinessRow, "id" | "name" | "short_description" | "publication_status">;
    return {
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
      publicationStatus: business.publication_status,
      source: "supabase" as const,
    };
  } catch {
    return null;
  }
}
