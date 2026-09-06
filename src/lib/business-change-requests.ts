import { createAdminClient } from "@/lib/supabase/admin";
import type { ModerationDecision, ModerationRisk, ModerationTriage } from "@/lib/types";

export type BusinessChangeRequestStatus = "open" | "reviewed" | "dismissed";

export type AdminBusinessChangeRequest = ModerationTriage & {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessManageToken: string;
  requesterEmail: string;
  reason: string;
  mediaItems: BusinessChangeRequestMedia[];
  status: BusinessChangeRequestStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type BusinessChangeRequestMedia = {
  id: string;
  url: string;
  caption: string;
  fileName: string;
  mimeType: string;
};

type BusinessChangeRequestRow = {
  id: string;
  business_id: string;
  requester_email: string;
  reason: string;
  status: BusinessChangeRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  moderation_decision?: ModerationDecision | null;
  moderation_risk?: ModerationRisk | null;
  moderation_reason?: string | null;
  moderation_signals?: unknown;
  business_change_request_media?: BusinessChangeRequestMediaRow[];
  businesses?:
    | { name: string | null; slug: string | null; manage_token: string | null }
    | { name: string | null; slug: string | null; manage_token: string | null }[]
    | null;
};

type BusinessChangeRequestMediaRow = {
  id: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  caption?: string | null;
};

export async function getAdminBusinessChangeRequests(): Promise<AdminBusinessChangeRequest[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_change_requests")
      .select("id, business_id, requester_email, reason, status, admin_notes, created_at, updated_at, moderation_decision, moderation_risk, moderation_reason, moderation_signals, business_change_request_media(id, bucket, storage_path, file_name, mime_type, caption), businesses(name, slug, manage_token)")
      .neq("status", "dismissed")
      .order("created_at", { ascending: false });

    if (error) return [];
    return ((data ?? []) as BusinessChangeRequestRow[]).map(rowToAdminBusinessChangeRequest);
  } catch {
    return [];
  }
}

function rowToAdminBusinessChangeRequest(row: BusinessChangeRequestRow): AdminBusinessChangeRequest {
  const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
  const supabase = createAdminClient();
  const mediaItems = (row.business_change_request_media ?? []).map((media) => {
    const { data } = supabase.storage.from(media.bucket).getPublicUrl(media.storage_path);
    return {
      id: media.id,
      url: data.publicUrl,
      caption: media.caption ?? "",
      fileName: media.file_name,
      mimeType: media.mime_type,
    };
  });

  return {
    id: row.id,
    businessId: row.business_id,
    businessName: business?.name ?? "Unknown business",
    businessSlug: business?.slug ?? "",
    businessManageToken: business?.manage_token ?? "",
    requesterEmail: row.requester_email,
    reason: row.reason,
    mediaItems,
    status: row.status,
    adminNotes: row.admin_notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    moderationDecision: row.moderation_decision ?? null,
    moderationRisk: row.moderation_risk ?? null,
    moderationReason: row.moderation_reason ?? null,
    moderationSignals: stringArrayFromJson(row.moderation_signals),
  };
}

function stringArrayFromJson(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
