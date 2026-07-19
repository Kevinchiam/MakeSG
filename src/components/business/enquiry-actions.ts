"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { getPublishedBusinesses } from "@/lib/public-businesses";

type EnquiryResult =
  | { ok: true; message: string }
  | { ok: false; message: string; address?: string; recipientEmail?: string };

const enquiryFormSchema = z.object({
  businessId: z.string().min(1),
  senderName: z.string().min(2, "Add your name."),
  senderEmail: z.string().email("Use a valid email address."),
  message: z.string().min(20, "Share a little more about the project."),
});

export async function sendBusinessEnquiry(input: unknown): Promise<EnquiryResult> {
  const parsed = enquiryFormSchema.safeParse(input instanceof FormData ? Object.fromEntries(input) : input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the enquiry form and try again." };
  }

  const businesses = await getPublishedBusinesses();
  const business = businesses.find((item) => item.id === parsed.data.businessId);

  if (!business) {
    return { ok: false, message: "This business profile could not be found." };
  }

  const address = business.address || business.location || "the listed business location";
  const recipientEmail = business.publicEmail.trim();
  if (!recipientEmail) {
    return {
      ok: false,
      message: "This business does not have an email listed. You may visit the location instead.",
      address,
    };
  }

  try {
    await sendEmail({
      to: recipientEmail,
      template: "new_enquiry_received",
      replyTo: parsed.data.senderEmail,
      variables: {
        name: business.name,
        business: business.name,
        senderName: parsed.data.senderName,
        senderEmail: parsed.data.senderEmail,
        message: parsed.data.message,
      },
    });
  } catch (error) {
    console.error("[enquiry-email-failed]", error);
    return {
      ok: false,
      message: "The enquiry could not be sent automatically right now. You can email the business directly.",
      recipientEmail,
    };
  }

  return { ok: true, message: `Your enquiry has been sent to ${business.name} at ${recipientEmail}.` };
}
