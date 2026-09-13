import type { Business, BusinessSubmissionSource } from "@/lib/types";

type BusinessSourceInput = Pick<Business, "claimed"> & { submissionSource?: BusinessSubmissionSource };

export type BusinessSourceStatus = "community_added" | "owner_added" | "owner_claimed" | "admin_maintained";

export function businessSourceLabel(business: BusinessSourceInput) {
  if (business.claimed) return "Owner claimed";
  if (business.submissionSource === "owner") return "Owner added";
  if (business.submissionSource === "admin") return "Admin maintained";
  return "Community added";
}

export function businessSourceDescription(business: BusinessSourceInput) {
  if (business.claimed) {
    return "This listing has been claimed by the business owner or an authorised representative.";
  }

  if (business.submissionSource === "owner") {
    return "This listing was added by someone representing the business and reviewed before appearing on MakeSG.";
  }

  if (business.submissionSource === "admin") {
    return "This listing is maintained by MakeSG from available information. The business owner can claim it or request a correction.";
  }

  return "This listing was shared by the community or added from public information. The business owner can claim it or request a correction.";
}

export function businessSourceStatus(business: BusinessSourceInput): BusinessSourceStatus {
  if (business.claimed) return "owner_claimed";
  if (business.submissionSource === "owner") return "owner_added";
  if (business.submissionSource === "admin") return "admin_maintained";
  return "community_added";
}
