"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

type ClaimBusinessResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const claimBusinessSchema = z.object({
  businessId: z.string().uuid("Choose a valid business."),
  requesterName: z.string().trim().min(2, "Add your name."),
  requesterRole: z.string().trim().optional(),
  requesterEmail: z.string().trim().email("Use a valid email address."),
  requesterPhone: z.string().trim().optional(),
  proofUrl: z.string().trim().url("Use a valid website or profile link.").optional().or(z.literal("")),
  message: z.string().trim().min(20, "Tell us how you are connected to the business in at least 20 characters."),
});

export async function requestBusinessClaim(formData: FormData): Promise<ClaimBusinessResult> {
  const parsed = claimBusinessSchema.safeParse({
    businessId: stringFromFormData(formData.get("businessId")),
    requesterName: stringFromFormData(formData.get("requesterName")),
    requesterRole: stringFromFormData(formData.get("requesterRole")),
    requesterEmail: stringFromFormData(formData.get("requesterEmail")),
    requesterPhone: stringFromFormData(formData.get("requesterPhone")),
    proofUrl: stringFromFormData(formData.get("proofUrl")),
    message: stringFromFormData(formData.get("message")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const supabase = createAdminClient();
  const { error } = await supabase.from("business_claim_requests").insert({
    business_id: data.businessId,
    requester_name: data.requesterName,
    requester_role: data.requesterRole?.trim() || null,
    requester_email: data.requesterEmail,
    requester_phone: data.requesterPhone?.trim() || null,
    proof_url: data.proofUrl?.trim() || null,
    message: data.message,
    status: "pending",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/claim-requests");
  return { ok: true, message: "Thanks, your claim request has been sent to MakeSG for review." };
}

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }

  return errors;
}
