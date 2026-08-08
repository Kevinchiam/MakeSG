"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { getPublishedBusinesses } from "@/lib/public-businesses";

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

  const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    return { ok: false, message: "Admin email is not configured yet. Add ADMIN_EMAIL in Vercel before collecting change requests." };
  }

  const businesses = await getPublishedBusinesses();
  const business = businesses.find((item) => item.id === parsed.data.businessId);
  if (!business) {
    return { ok: false, message: "This business listing could not be found." };
  }

  try {
    await sendEmail({
      to: adminEmail,
      template: "admin_notification",
      replyTo: parsed.data.requesterEmail,
      variables: {
        message: [
          `Business change request for ${business.name}`,
          `Listing: ${business.slug}`,
          `Requester email: ${parsed.data.requesterEmail}`,
          "",
          parsed.data.reason,
        ].join("\n"),
      },
    });
  } catch (error) {
    console.error("[business-change-request-email-failed]", error);
    return { ok: false, message: "The change request could not be emailed right now. Please try again later." };
  }

  return { ok: true, message: "Change request sent to MakeSG admin for review." };
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
