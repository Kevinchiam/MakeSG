import { createAdminClient } from "@/lib/supabase/admin";

export type AdminBusinessClaimRequest = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;
  proofUrl: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

type BusinessClaimRequestRow = {
  id: string;
  business_id: string;
  requester_name: string;
  requester_role: string | null;
  requester_email: string;
  requester_phone: string | null;
  proof_url: string | null;
  message: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  businesses?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export async function getAdminBusinessClaimRequests(): Promise<AdminBusinessClaimRequest[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("business_claim_requests")
      .select("id, business_id, requester_name, requester_role, requester_email, requester_phone, proof_url, message, status, admin_notes, created_at, updated_at, businesses(name, slug)")
      .order("created_at", { ascending: false });

    if (error) return [];

    return ((data ?? []) as unknown as BusinessClaimRequestRow[]).map((request) => {
      const business = Array.isArray(request.businesses) ? request.businesses[0] : request.businesses;
      return {
        id: request.id,
        businessId: request.business_id,
        businessName: business?.name ?? "Unknown business",
        businessSlug: business?.slug ?? "",
        requesterName: request.requester_name,
        requesterRole: request.requester_role ?? "",
        requesterEmail: request.requester_email,
        requesterPhone: request.requester_phone ?? "",
        proofUrl: request.proof_url ?? "",
        message: request.message,
        status: request.status,
        adminNotes: request.admin_notes ?? "",
        createdAt: request.created_at,
        updatedAt: request.updated_at,
      };
    });
  } catch {
    return [];
  }
}
