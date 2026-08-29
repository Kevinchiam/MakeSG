import { businessRecommendations as demoRecommendations, businesses as demoBusinesses } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessRecommendation, BusinessRecommendationStatus, ModerationDecision, ModerationRisk, ModerationTriage } from "@/lib/types";

type RecommendationRow = {
  id: string;
  business_id: string;
  recommender_name: string;
  recommender_role: string | null;
  recommender_email: string | null;
  relationship: BusinessRecommendation["relationship"];
  project_context: string;
  recommended_for: string[] | null;
  comment: string;
  quality_rating: number | null;
  reliability_rating: number | null;
  collaboration_rating: number | null;
  supporting_links: string[] | null;
  permission_to_contact: boolean;
  permission_to_publish_name: boolean;
  status: BusinessRecommendationStatus;
  created_at: string;
  moderation_decision?: ModerationDecision | null;
  moderation_risk?: ModerationRisk | null;
  moderation_reason?: string | null;
  moderation_signals?: unknown;
  business_recommendation_media?: RecommendationMediaRow[];
  businesses?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type RecommendationMediaRow = {
  id: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  caption?: string | null;
};

export type AdminBusinessRecommendation = BusinessRecommendation & {
  businessName: string;
  businessSlug?: string;
  source: "supabase" | "demo";
};

export async function getApprovedRecommendationsForBusiness(businessId: string): Promise<BusinessRecommendation[]> {
  const demo = demoRecommendations.filter(
    (recommendation) => recommendation.businessId === businessId && recommendation.status === "approved",
  );

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_recommendations")
      .select(
        "id, business_id, recommender_name, recommender_role, recommender_email, relationship, project_context, recommended_for, comment, quality_rating, reliability_rating, collaboration_rating, supporting_links, permission_to_contact, permission_to_publish_name, status, created_at, business_recommendation_media(id, bucket, storage_path, file_name, mime_type, caption)",
      )
      .eq("business_id", businessId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) return demo;
    return [...((data ?? []) as unknown as RecommendationRow[]).map(rowToRecommendation), ...demo];
  } catch {
    return demo;
  }
}

export async function getAdminBusinessRecommendations(): Promise<AdminBusinessRecommendation[]> {
  const demo = demoRecommendations.map((recommendation) => {
    const business = demoBusinesses.find((item) => item.id === recommendation.businessId);
    return {
      ...recommendation,
      businessName: business?.name ?? "Unknown business",
      businessSlug: business?.slug,
      source: "demo" as const,
    };
  });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_recommendations")
      .select(
        "id, business_id, recommender_name, recommender_role, recommender_email, relationship, project_context, recommended_for, comment, quality_rating, reliability_rating, collaboration_rating, supporting_links, permission_to_contact, permission_to_publish_name, status, created_at, moderation_decision, moderation_risk, moderation_reason, moderation_signals, business_recommendation_media(id, bucket, storage_path, file_name, mime_type, caption), businesses(name, slug)",
      )
      .neq("status", "rejected")
      .order("created_at", { ascending: false });

    if (error) return demo;

    const submitted = ((data ?? []) as unknown as RecommendationRow[]).map((row) => {
      const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
      return {
        ...rowToRecommendation(row),
        businessName: business?.name ?? "Unknown business",
        businessSlug: business?.slug,
        source: "supabase" as const,
      };
    });

    return [...submitted, ...demo];
  } catch {
    return demo;
  }
}

function rowToRecommendation(row: RecommendationRow): BusinessRecommendation {
  const mediaItems = (row.business_recommendation_media ?? []).map((media) => {
    const supabase = createAdminClient();
    const { data } = supabase.storage.from(media.bucket).getPublicUrl(media.storage_path);
    return {
      id: media.id,
      url: data.publicUrl,
      caption: media.caption ?? "",
      mimeType: media.mime_type,
    };
  });

  return {
    id: row.id,
    businessId: row.business_id,
    recommenderName: row.recommender_name,
    recommenderRole: row.recommender_role ?? undefined,
    recommenderEmail: row.recommender_email ?? undefined,
    relationship: row.relationship,
    projectContext: row.project_context,
    recommendedFor: row.recommended_for ?? [],
    comment: row.comment,
    qualityRating: row.quality_rating ?? undefined,
    reliabilityRating: row.reliability_rating ?? undefined,
    collaborationRating: row.collaboration_rating ?? undefined,
    supportingLinks: row.supporting_links ?? [],
    mediaItems,
    mediaUrls: mediaItems.map((item) => item.url),
    permissionToContact: row.permission_to_contact,
    permissionToPublishName: row.permission_to_publish_name,
    status: row.status,
    createdAt: row.created_at,
    ...moderationFields(row),
  };
}

function moderationFields(row: {
  moderation_decision?: ModerationDecision | null;
  moderation_risk?: ModerationRisk | null;
  moderation_reason?: string | null;
  moderation_signals?: unknown;
}): ModerationTriage {
  return {
    moderationDecision: row.moderation_decision ?? null,
    moderationRisk: row.moderation_risk ?? null,
    moderationReason: row.moderation_reason ?? null,
    moderationSignals: stringArrayFromJson(row.moderation_signals),
  };
}

function stringArrayFromJson(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
