"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

type ChangeRequestResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const changeRequestSchema = z.object({
  businessId: z.string().min(1),
  requesterEmail: z.string().email("Use a valid email address."),
  reason: z.string().min(20, "Describe the requested change in at least 20 characters."),
});

export async function requestBusinessChange(formData: FormData): Promise<ChangeRequestResult> {
  const parsed = changeRequestSchema.safeParse({
    businessId: formData.get("businessId"),
    requesterEmail: formData.get("requesterEmail"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("business_change_requests").insert({
      business_id: parsed.data.businessId,
      requester_email: parsed.data.requesterEmail,
      reason: parsed.data.reason,
      status: "open",
    });

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    console.error("[business-change-request-failed]", error);
    return { ok: false, message: "Change requests are not available yet. Please try again after the admin database is updated." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/change-requests");
  return { ok: true, message: "Change request saved for MakeSG admin review." };
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
