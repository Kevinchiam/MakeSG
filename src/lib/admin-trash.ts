import { createAdminClient } from "@/lib/supabase/admin";

const RETENTION_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AdminTrashKind = "business" | "business_edit" | "recommendation" | "creative_job" | "change_request";

export type AdminTrashItem = {
  id: string;
  kind: AdminTrashKind;
  title: string;
  description: string;
  status: string;
  trashedAt: string;
  deleteAfter: string;
  href?: string;
};

type BusinessTrashRow = {
  id: string;
  name: string;
  short_description: string | null;
  updated_at: string;
};

type BusinessRevisionTrashRow = {
  id: string;
  business_id: string;
  updated_at: string;
  proposed_data: { name?: string; shortDescription?: string } | null;
  businesses?: { name: string | null } | { name: string | null }[] | null;
};

type RecommendationTrashRow = {
  id: string;
  comment: string;
  updated_at: string;
  businesses?: { name: string | null } | { name: string | null }[] | null;
};

type CreativeJobTrashRow = {
  id: string;
  title: string;
  description: string | null;
  updated_at: string;
};

type ChangeRequestTrashRow = {
  id: string;
  reason: string;
  updated_at: string;
  businesses?: { name: string | null } | { name: string | null }[] | null;
};

export async function getAdminTrashItems({ purgeExpired = true } = {}): Promise<AdminTrashItem[]> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return [];
  }

  if (purgeExpired) {
    await purgeExpiredTrashItems(supabase);
  }

  const [businesses, revisions, recommendations, creativeJobs, changeRequests] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, short_description, updated_at")
      .eq("publication_status", "rejected")
      .order("updated_at", { ascending: false }),
    supabase
      .from("business_listing_revisions")
      .select("id, business_id, updated_at, proposed_data, businesses(name)")
      .eq("status", "rejected")
      .order("updated_at", { ascending: false }),
    supabase
      .from("business_recommendations")
      .select("id, comment, updated_at, businesses(name)")
      .eq("status", "rejected")
      .order("updated_at", { ascending: false }),
    supabase
      .from("creative_job_listings")
      .select("id, title, description, updated_at")
      .eq("status", "archived")
      .order("updated_at", { ascending: false }),
    supabase
      .from("business_change_requests")
      .select("id, reason, updated_at, businesses(name)")
      .eq("status", "dismissed")
      .order("updated_at", { ascending: false }),
  ]);

  return [
    ...((businesses.data ?? []) as BusinessTrashRow[]).map((item) => ({
      id: item.id,
      kind: "business" as const,
      title: item.name,
      description: item.short_description ?? "Rejected business listing.",
      status: "Rejected business listing",
      href: `/admin/businesses/${item.id}`,
      ...trashDates(item.updated_at),
    })),
    ...((revisions.data ?? []) as unknown as BusinessRevisionTrashRow[]).map((item) => {
      const business = relatedBusiness(item.businesses);
      return {
        id: item.id,
        kind: "business_edit" as const,
        title: item.proposed_data?.name ?? business?.name ?? "Business edit",
        description: item.proposed_data?.shortDescription ?? "Rejected edits. The live listing was not changed.",
        status: "Rejected business edit",
        href: `/admin/businesses/${item.business_id}`,
        ...trashDates(item.updated_at),
      };
    }),
    ...((recommendations.data ?? []) as unknown as RecommendationTrashRow[]).map((item) => {
      const business = relatedBusiness(item.businesses);
      return {
        id: item.id,
        kind: "recommendation" as const,
        title: business?.name ? `Recommendation for ${business.name}` : "Business recommendation",
        description: item.comment,
        status: "Rejected recommendation",
        href: "/admin/recommendations",
        ...trashDates(item.updated_at),
      };
    }),
    ...((creativeJobs.data ?? []) as CreativeJobTrashRow[]).map((item) => ({
      id: item.id,
      kind: "creative_job" as const,
      title: item.title,
      description: item.description ?? "Archived creative job.",
      status: "Archived creative job",
      href: `/admin/creative-jobs/${item.id}`,
      ...trashDates(item.updated_at),
    })),
    ...((changeRequests.data ?? []) as unknown as ChangeRequestTrashRow[]).map((item) => {
      const business = relatedBusiness(item.businesses);
      return {
        id: item.id,
        kind: "change_request" as const,
        title: business?.name ? `Change request for ${business.name}` : "Business change request",
        description: item.reason,
        status: "Dismissed change request",
        href: "/admin/change-requests",
        ...trashDates(item.updated_at),
      };
    }),
  ].sort((a, b) => new Date(b.trashedAt).getTime() - new Date(a.trashedAt).getTime());
}

async function purgeExpiredTrashItems(supabase: ReturnType<typeof createAdminClient>) {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * MS_PER_DAY).toISOString();

  await cleanupRejectedBusinessStorage(supabase, cutoff);
  await cleanupRejectedRevisionStorage(supabase, cutoff);
  await cleanupRejectedRecommendationStorage(supabase, cutoff);
  await cleanupArchivedCreativeJobStorage(supabase, cutoff);

  await Promise.all([
    supabase.from("businesses").delete().eq("publication_status", "rejected").lt("updated_at", cutoff),
    supabase.from("business_listing_revisions").delete().eq("status", "rejected").lt("updated_at", cutoff),
    supabase.from("business_recommendations").delete().eq("status", "rejected").lt("updated_at", cutoff),
    supabase.from("creative_job_listings").delete().eq("status", "archived").lt("updated_at", cutoff),
    supabase.from("business_change_requests").delete().eq("status", "dismissed").lt("updated_at", cutoff),
  ]);
}

async function cleanupRejectedBusinessStorage(supabase: ReturnType<typeof createAdminClient>, cutoff: string) {
  const { data } = await supabase
    .from("businesses")
    .select("id, portfolio_items(storage_path)")
    .eq("publication_status", "rejected")
    .lt("updated_at", cutoff);

  const paths = ((data ?? []) as Array<{ portfolio_items?: Array<{ storage_path: string | null }> }>)
    .flatMap((business) => business.portfolio_items ?? [])
    .map((item) => item.storage_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length) await supabase.storage.from("business-portfolios").remove(paths);
}

async function cleanupRejectedRevisionStorage(supabase: ReturnType<typeof createAdminClient>, cutoff: string) {
  const { data } = await supabase
    .from("business_listing_revisions")
    .select("proposed_portfolio")
    .eq("status", "rejected")
    .lt("updated_at", cutoff);

  const paths = ((data ?? []) as Array<{ proposed_portfolio?: Array<{ storagePath?: string }> }>)
    .flatMap((revision) => revision.proposed_portfolio ?? [])
    .map((item) => item.storagePath)
    .filter((path): path is string => Boolean(path));

  if (paths.length) await supabase.storage.from("business-portfolios").remove(paths);
}

async function cleanupRejectedRecommendationStorage(supabase: ReturnType<typeof createAdminClient>, cutoff: string) {
  const { data } = await supabase
    .from("business_recommendations")
    .select("business_recommendation_media(storage_path)")
    .eq("status", "rejected")
    .lt("updated_at", cutoff);

  const paths = ((data ?? []) as Array<{ business_recommendation_media?: Array<{ storage_path: string | null }> }>)
    .flatMap((recommendation) => recommendation.business_recommendation_media ?? [])
    .map((item) => item.storage_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length) await supabase.storage.from("business-portfolios").remove(paths);
}

async function cleanupArchivedCreativeJobStorage(supabase: ReturnType<typeof createAdminClient>, cutoff: string) {
  const { data } = await supabase
    .from("creative_job_listings")
    .select("creative_job_reference_files(storage_path)")
    .eq("status", "archived")
    .lt("updated_at", cutoff);

  const paths = ((data ?? []) as Array<{ creative_job_reference_files?: Array<{ storage_path: string | null }> }>)
    .flatMap((job) => job.creative_job_reference_files ?? [])
    .map((item) => item.storage_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length) await supabase.storage.from("creative-job-references").remove(paths);
}

function trashDates(trashedAt: string) {
  const created = new Date(trashedAt);
  const deleteAfter = new Date(created.getTime() + RETENTION_DAYS * MS_PER_DAY);
  return {
    trashedAt: created.toISOString(),
    deleteAfter: deleteAfter.toISOString(),
  };
}

function relatedBusiness(value: { name: string | null } | { name: string | null }[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
