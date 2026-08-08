import { createAdminClient } from "@/lib/supabase/admin";

export type BusinessChangeRequestStatus = "open" | "reviewed" | "dismissed";

export type AdminBusinessChangeRequest = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessManageToken: string;
  requesterEmail: string;
  reason: string;
  status: BusinessChangeRequestStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
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
  businesses?:
    | { name: string | null; slug: string | null; manage_token: string | null }
    | { name: string | null; slug: string | null; manage_token: string | null }[]
    | null;
};

export async function getAdminBusinessChangeRequests(): Promise<AdminBusinessChangeRequest[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_change_requests")
      .select("id, business_id, requester_email, reason, status, admin_notes, created_at, updated_at, businesses(name, slug, manage_token)")
      .order("created_at", { ascending: false });

    if (error) return [];
    return ((data ?? []) as BusinessChangeRequestRow[]).map(rowToAdminBusinessChangeRequest);
  } catch {
    return [];
  }
}

function rowToAdminBusinessChangeRequest(row: BusinessChangeRequestRow): AdminBusinessChangeRequest {
  const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: business?.name ?? "Unknown business",
    businessSlug: business?.slug ?? "",
    businessManageToken: business?.manage_token ?? "",
    requesterEmail: row.requester_email,
    reason: row.reason,
    status: row.status,
    adminNotes: row.admin_notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
