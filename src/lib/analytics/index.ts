export type AnalyticsEvent =
  | "search_submitted"
  | "filter_applied"
  | "business_viewed"
  | "business_saved"
  | "project_created"
  | "recommendations_viewed"
  | "enquiry_started"
  | "enquiry_submitted"
  | "provider_signup_started"
  | "business_submitted"
  | "business_recommendation_submitted"
  | "business_recommendation_approved";

export function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event, properties);
    return;
  }
}
