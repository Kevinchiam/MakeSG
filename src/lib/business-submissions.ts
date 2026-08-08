import { businesses } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessType, PortfolioItem, PublicationStatus, VerificationStatus } from "@/lib/types";

export type AdminBusinessSummary = {
  id: string;
  name: string;
  shortDescription: string;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  source: "supabase" | "demo";
  endorsementCount: number;
  pendingRevision: boolean;
};

type BusinessRow = {
  id: string;
  name: string;
  slug?: string;
  short_description: string;
  description?: string;
  website_url?: string | null;
  public_email?: string | null;
  public_phone?: string | null;
  address?: string | null;
  minimum_budget?: number | null;
  typical_lead_time?: number | null;
  business_type?: string | null;
  publication_status: PublicationStatus;
  verification_status: VerificationStatus;
  manage_token?: string | null;
  endorsement_count?: number | null;
  business_services?: { services: { name: string; slug: string } | { name: string; slug: string }[] | null }[];
  portfolio_items?: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    tags: string[] | null;
    file_name?: string | null;
    storage_path?: string | null;
    mime_type?: string | null;
    size_bytes?: number | null;
  }[];
};

export type PortfolioRevisionItem = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  fileName?: string;
  storagePath?: string;
  mimeType?: string;
  sizeBytes?: number;
  isNew?: boolean;
};

type BusinessRevisionRow = {
  id: string;
  status: "pending" | "approved" | "rejected";
  proposed_data: {
    name?: string;
    shortDescription?: string;
    description?: string;
    websiteUrl?: string;
    publicEmail?: string;
    phoneNumber?: string;
    location?: string;
    minimumBudget?: number;
    typicalLeadTime?: number;
    businessType?: BusinessType;
  };
  proposed_services: string[] | null;
  proposed_portfolio: PortfolioRevisionItem[] | null;
};

export type PendingBusinessRevision = {
  id: string;
  data: BusinessRevisionRow["proposed_data"];
  services: string[];
  portfolio: PortfolioItem[];
};

export type ManagedBusiness = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  websiteUrl: string;
  publicEmail: string;
  phoneNumber: string;
  location: string;
  minimumBudget: number;
  typicalLeadTime: number;
  businessType: BusinessType;
  services: string[];
  portfolio: PortfolioItem[];
  publicationStatus: PublicationStatus;
  endorsementCount: number;
  manageToken: string;
  pendingRevision: boolean;
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
    pendingRevision: false,
    source: "demo" as const,
  }));

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, publication_status, verification_status, endorsement_count, business_listing_revisions(status)")
      .order("created_at", { ascending: false });

    const submittedBusinesses = ((data ?? []) as Array<BusinessRow & { business_listing_revisions?: { status: string }[] }>).map((business) => ({
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
      publicationStatus: business.publication_status,
      verificationStatus: business.verification_status,
      endorsementCount: business.endorsement_count ?? 0,
      pendingRevision: hasPendingRevision(business.business_listing_revisions),
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
      phoneNumber: demoBusiness.publicPhone ?? "",
      location: demoBusiness.location,
      minimumBudget: demoBusiness.minimumBudget,
      typicalLeadTime: demoBusiness.typicalLeadTime,
      businessType: demoBusiness.businessType,
      services: demoBusiness.services,
      portfolio: demoBusiness.portfolio,
      publicationStatus: demoBusiness.publicationStatus,
      endorsementCount: demoBusiness.endorsementCount,
      pendingRevision: null,
      source: "demo" as const,
    };
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("id, name, short_description, description, website_url, public_email, public_phone, address, minimum_budget, typical_lead_time, business_type, publication_status, endorsement_count, business_services(services(name, slug)), portfolio_items(id, title, description, image_url, tags, file_name, storage_path, mime_type, size_bytes), business_listing_revisions(id, status, proposed_data, proposed_services, proposed_portfolio)")
      .eq("id", id)
      .single();

    if (!data) return null;

    const business = data as unknown as BusinessRow & { business_listing_revisions?: BusinessRevisionRow[] };
    const pendingRevision = pendingRevisionFromRows(business.business_listing_revisions);
    return {
      id: business.id,
      name: business.name,
      shortDescription: business.short_description,
      description: business.description ?? "",
      websiteUrl: business.website_url ?? "",
      publicEmail: business.public_email ?? "",
      phoneNumber: business.public_phone ?? "",
      location: business.address ?? "",
      minimumBudget: business.minimum_budget ?? 0,
      typicalLeadTime: business.typical_lead_time ?? 0,
      businessType: business.business_type ?? "studio",
      services: business.business_services?.flatMap((join) => {
        if (!join.services) return [];
        if (Array.isArray(join.services)) return join.services.map((service) => service.name);
        return [join.services.name];
      }) ?? [],
      portfolio: business.portfolio_items?.filter((item) => Boolean(item.image_url)).map(portfolioRowToItem) ?? [],
      publicationStatus: business.publication_status,
      endorsementCount: business.endorsement_count ?? 0,
      pendingRevision,
      source: "supabase" as const,
    };
  } catch {
    return null;
  }
}

export async function getBusinessByManageToken(token: string): Promise<ManagedBusiness | null> {
  if (!token) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, short_description, description, website_url, public_email, public_phone, address, minimum_budget, typical_lead_time, business_type, publication_status, manage_token, endorsement_count, business_services(services(name, slug)), portfolio_items(id, title, description, image_url, tags, file_name, storage_path, mime_type, size_bytes), business_listing_revisions(id, status, proposed_data, proposed_services, proposed_portfolio)")
      .eq("manage_token", token)
      .single();

    if (error || !data) return null;

    const business = data as unknown as BusinessRow & { business_listing_revisions?: BusinessRevisionRow[] };
    const pendingRevision = pendingRevisionFromRows(business.business_listing_revisions);
    const baseServices = business.business_services?.flatMap((join) => {
      if (!join.services) return [];
      if (Array.isArray(join.services)) return join.services.map((service) => service.name);
      return [join.services.name];
    }) ?? [];
    const basePortfolio = business.portfolio_items?.filter((item) => Boolean(item.image_url)).map(portfolioRowToItem) ?? [];
    const displayData = pendingRevision?.data;
    return {
      id: business.id,
      name: displayData?.name ?? business.name,
      shortDescription: displayData?.shortDescription ?? business.short_description,
      description: displayData?.description ?? business.description ?? "",
      websiteUrl: displayData?.websiteUrl ?? business.website_url ?? "",
      publicEmail: displayData?.publicEmail ?? business.public_email ?? "",
      phoneNumber: displayData?.phoneNumber ?? business.public_phone ?? "",
      location: displayData?.location ?? business.address ?? "",
      minimumBudget: displayData?.minimumBudget ?? business.minimum_budget ?? 0,
      typicalLeadTime: displayData?.typicalLeadTime ?? business.typical_lead_time ?? 14,
      businessType: (displayData?.businessType ?? business.business_type ?? "studio") as BusinessType,
      services: pendingRevision?.services ?? baseServices,
      portfolio: pendingRevision?.portfolio ?? basePortfolio,
      publicationStatus: business.publication_status,
      endorsementCount: business.endorsement_count ?? 0,
      manageToken: business.manage_token ?? token,
      pendingRevision: Boolean(pendingRevision),
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

function portfolioRowToItem(item: NonNullable<BusinessRow["portfolio_items"]>[number]): PortfolioItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    imageUrl: item.image_url ?? "",
    tags: item.tags ?? [],
    fileName: item.file_name ?? undefined,
    storagePath: item.storage_path ?? undefined,
    mimeType: item.mime_type ?? undefined,
    sizeBytes: item.size_bytes ?? undefined,
  };
}

function pendingRevisionFromRows(rows: BusinessRevisionRow[] | undefined): PendingBusinessRevision | null {
  const revision = rows?.find((row) => row.status === "pending");
  if (!revision) return null;

  return {
    id: revision.id,
    data: revision.proposed_data,
    services: revision.proposed_services ?? [],
    portfolio: (revision.proposed_portfolio ?? []).map((item, index) => ({
      id: item.id ?? `revision-${index}`,
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      tags: item.tags ?? [],
      fileName: item.fileName,
      storagePath: item.storagePath,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
    })),
  };
}

function hasPendingRevision(rows: { status: string }[] | undefined) {
  return Boolean(rows?.some((row) => row.status === "pending"));
}
