import type { Business, BusinessSubmissionSource } from "@/lib/types";

type BusinessSourceInput = Pick<Business, "claimed"> & { submissionSource?: BusinessSubmissionSource };

export function businessSourceLabel(business: BusinessSourceInput) {
  if (business.claimed) return "Owner claimed";
  if (business.submissionSource === "owner") return "Owner submitted";
  if (business.submissionSource === "admin") return "MakeSG added";
  return "Community added";
}

export function businessSourceDescription(business: BusinessSourceInput) {
  if (business.claimed) {
    return "This listing has been claimed by the business owner or an authorised representative.";
  }

  if (business.submissionSource === "owner") {
    return "This listing was submitted by someone representing the business and reviewed before appearing on MakeSG.";
  }

  if (business.submissionSource === "admin") {
    return "This listing was added by MakeSG from available information. The business owner can claim it or request a correction.";
  }

  return "This listing was shared by the community or added from public information. The business owner can claim it or request a correction.";
}
