import { Resend } from "resend";

export type EmailTemplate =
  | "new_enquiry_received"
  | "enquiry_confirmation"
  | "business_submitted_for_approval"
  | "business_approved"
  | "business_rejected"
  | "profile_claimed"
  | "admin_notification";

const subjects: Record<EmailTemplate, string> = {
  new_enquiry_received: "New MakeSG enquiry",
  enquiry_confirmation: "Your MakeSG enquiry was sent",
  business_submitted_for_approval: "Business submitted for approval",
  business_approved: "Your MakeSG listing is live",
  business_rejected: "Your MakeSG listing needs changes",
  profile_claimed: "MakeSG profile claimed",
  admin_notification: "MakeSG admin notification",
};

export async function sendEmail(input: {
  to: string;
  template: EmailTemplate;
  variables?: Record<string, string>;
  replyTo?: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  const html = renderTemplate(input.template, input.variables ?? {});

  if (!process.env.RESEND_API_KEY || !from) {
    console.info("[email:not-configured]", { to: input.to, subject: subjects[input.template], html });
    throw new Error("Email sending is not configured.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: subjects[input.template],
    html,
    replyTo: input.replyTo,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function renderTemplate(template: EmailTemplate, variables: Record<string, string>) {
  const name = variables.name ?? "there";
  if (template === "new_enquiry_received") {
    return `<main style="font-family:system-ui,sans-serif;line-height:1.6;color:#211f1b"><h1>${escapeHtml(subjects[template])}</h1><p>Hi ${escapeHtml(name)}, a creative has sent an enquiry through MakeSG.</p><p><strong>From:</strong> ${escapeHtml(variables.senderName ?? "Not provided")}<br><strong>Reply email:</strong> ${escapeHtml(variables.senderEmail ?? "Not provided")}</p><p><strong>Message:</strong><br>${escapeHtml(variables.message ?? "No message provided.").replace(/\n/g, "<br>")}</p></main>`;
  }

  const body: Record<EmailTemplate, string> = {
    new_enquiry_received: "",
    enquiry_confirmation: `Hi ${name}, your enquiry has been sent. The provider can reply using your shared contact details.`,
    business_submitted_for_approval: `Hi ${name}, your listing is pending review by the MakeSG team.`,
    business_approved: `Hi ${name}, your listing has been approved and published.`,
    business_rejected: `Hi ${name}, your listing needs a few changes before it can be published.`,
    profile_claimed: `Hi ${name}, this MakeSG profile has been marked as claimed.`,
    admin_notification: `Admin note: ${variables.message ?? "A MakeSG action needs review."}`,
  };

  return `<main style="font-family:system-ui,sans-serif;line-height:1.6;color:#211f1b"><h1>${escapeHtml(subjects[template])}</h1><p>${escapeHtml(body[template])}</p></main>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
