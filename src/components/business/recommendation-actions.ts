"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { assessModeration, moderationBlockMessage } from "@/lib/moderation";
import { businessRecommendationSchema } from "@/lib/validation";

type SubmitRecommendationResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const mediaTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]);

export async function submitBusinessRecommendation(formData: FormData): Promise<SubmitRecommendationResult> {
  const parsed = businessRecommendationSchema.safeParse(formDataToRecommendationInput(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, message: "Supabase is not configured for recommendations yet." };
  }

  const data = parsed.data;
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("id", data.businessId)
    .single();

  if (businessError || !business) {
    return { ok: false, message: "This listing cannot receive recommendations yet." };
  }

  const mediaFiles = validMediaFiles(formData.getAll("recommendationMedia"));
  const invalidMediaCount = formData.getAll("recommendationMedia").filter((value) => {
    return typeof value !== "string" && value.size > 0 && !mediaTypes.has(value.type);
  }).length;
  if (invalidMediaCount > 0) {
    return {
      ok: false,
      message: "Upload JPG, PNG, WebP, MP4, MOV or WebM files only.",
      fieldErrors: { media: "Upload JPG, PNG, WebP, MP4, MOV or WebM files only." },
    };
  }

  const mediaCaptions = formData.getAll("recommendationMediaCaptions").map((value) => stringFromFormData(value).trim());
  const totalSizeMb = mediaFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024;
  if (totalSizeMb > 10) {
    return {
      ok: false,
      message: "Supporting photos or videos must be 10MB total or smaller.",
      fieldErrors: { media: "Supporting photos or videos must be 10MB total or smaller." },
    };
  }

  const moderation = assessModeration({
    kind: "recommendation",
    texts: [
      data.recommenderName,
      data.recommenderEmail,
      data.review,
      ...data.supportingLinks,
      ...mediaCaptions,
      ...ratingLabels(data),
    ],
    filenames: mediaFiles.map((file) => file.name),
    linkCount: data.supportingLinks.length,
    hasContact: Boolean(data.recommenderEmail),
    hasMedia: mediaFiles.length > 0,
  });

  if (moderation.decision === "blocked") {
    return { ok: false, message: moderationBlockMessage(moderation) };
  }

  const { data: recommendation, error: recommendationError } = await supabase
    .from("business_recommendations")
    .insert({
      business_id: data.businessId,
      recommender_name: data.recommenderName,
      recommender_email: data.recommenderEmail,
      relationship: "client",
      project_context: "Business profile recommendation",
      recommended_for: ratingLabels(data),
      comment: data.review,
      quality_rating: data.qualityRating,
      reliability_rating: data.reliabilityRating,
      collaboration_rating: data.collaborationRating,
      supporting_links: data.supportingLinks,
      permission_to_contact: true,
      permission_to_publish_name: data.permissionToPublishName,
      status: "pending",
      moderation_decision: moderation.decision,
      moderation_risk: moderation.risk,
      moderation_reason: moderation.reason,
      moderation_signals: moderation.signals,
    })
    .select("id")
    .single();

  if (recommendationError || !recommendation) {
    return { ok: false, message: recommendationError?.message ?? "Could not submit this recommendation." };
  }

  const uploadedMedia = [];
  const uploadedPaths: string[] = [];
  for (const [index, file] of mediaFiles.entries()) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "upload";
    const path = `recommendations/${recommendation.id}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("business-portfolios").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      await cleanupRecommendationSubmission(supabase, recommendation.id, uploadedPaths);
      return { ok: false, message: uploadError.message };
    }

    uploadedPaths.push(path);
    uploadedMedia.push({
      recommendation_id: recommendation.id,
      bucket: "business-portfolios",
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      sort_order: index,
      caption: mediaCaptions[index] ?? "",
    });
  }

  if (uploadedMedia.length > 0) {
    const { error: mediaError } = await supabase.from("business_recommendation_media").insert(uploadedMedia);
    if (mediaError) {
      await cleanupRecommendationSubmission(supabase, recommendation.id, uploadedPaths);
      return { ok: false, message: mediaError.message };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/recommendations");
  revalidatePath(`/businesses/${business.slug}`);
  return { ok: true };
}

function formDataToRecommendationInput(formData: FormData) {
  return {
    businessId: stringFromFormData(formData.get("businessId")),
    recommenderName: stringFromFormData(formData.get("recommenderName")),
    recommenderEmail: stringFromFormData(formData.get("recommenderEmail")),
    qualityRating: stringFromFormData(formData.get("qualityRating")),
    reliabilityRating: stringFromFormData(formData.get("reliabilityRating")),
    collaborationRating: stringFromFormData(formData.get("collaborationRating")),
    review: stringFromFormData(formData.get("review")),
    supportingLinks: formData.getAll("supportingLinks").map((value) => stringFromFormData(value).trim()).filter(Boolean),
    permissionToPublishName: formData.get("permissionToPublishName") === "on",
  };
}

function ratingLabels(data: z.infer<typeof businessRecommendationSchema>) {
  return [
    `Quality ${data.qualityRating}/5`,
    `Reliability ${data.reliabilityRating}/5`,
    `Collaboration ${data.collaborationRating}/5`,
  ];
}

function validMediaFiles(values: FormDataEntryValue[]) {
  return values.filter((value): value is File => {
    return typeof value !== "string" && value.size > 0 && mediaTypes.has(value.type);
  });
}

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  return issues.reduce<Record<string, string>>((errors, issue) => {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
    return errors;
  }, {});
}

async function cleanupRecommendationSubmission(
  supabase: ReturnType<typeof createAdminClient>,
  recommendationId: string,
  uploadedPaths: string[],
) {
  if (uploadedPaths.length > 0) {
    await supabase.storage.from("business-portfolios").remove(uploadedPaths);
  }
  await supabase.from("business_recommendations").delete().eq("id", recommendationId);
}
