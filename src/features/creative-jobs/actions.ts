"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { services as knownServices } from "@/lib/data";
import { assessModeration, moderationBlockMessage } from "@/lib/moderation";
import type { CreativeJobStatus } from "@/lib/creative-jobs";
import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { creativeJobSchema } from "@/lib/validation";

type SubmitCreativeJobResult =
  | { ok: true; id: string; slug: string; manageToken: string; status: CreativeJobStatus }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type UpdateCreativeJobStatusResult =
  | { ok: true; status: CreativeJobStatus }
  | { ok: false; message: string };

type UpdateCreativeJobDetailsResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type UpdateCreativeJobMediaResult =
  | { ok: true }
  | { ok: false; message: string };

export async function submitCreativeJobListing(input: unknown): Promise<SubmitCreativeJobResult> {
  const formInput = input instanceof FormData ? formDataToCreativeJobInput(input) : input;
  const parsed = creativeJobSchema.safeParse(formInput);

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
    return { ok: false, message: "Supabase is not configured for creative job listings yet." };
  }

  const data = parsed.data;
  const referenceFiles = input instanceof FormData ? validReferenceFiles(input.getAll("referenceFiles")) : [];
  const referenceCaptions = input instanceof FormData ? input.getAll("referenceCaptions").map((value) => stringFromFormData(value).trim()) : [];
  const totalReferenceSizeMb = referenceFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024;
  if (totalReferenceSizeMb > 10) {
    return { ok: false, message: "Reference uploads must be 10MB total or smaller." };
  }
  const moderation = assessModeration({
    kind: "creative_job",
    texts: [
      data.title,
      data.description,
      data.contactName,
      data.contactEmail,
      data.companyName,
      data.projectType,
      data.otherService,
      data.referenceLinks,
      data.notes,
      ...data.services,
      ...referenceCaptions,
    ],
    filenames: referenceFiles.map((file) => file.name),
    linkCount: data.referenceLinks ? data.referenceLinks.split(/\s+/).filter((value) => value.startsWith("http")).length : 0,
    hasContact: Boolean(data.contactEmail),
    hasMedia: referenceFiles.length > 0,
  });

  if (moderation.decision === "blocked") {
    return { ok: false, message: moderationBlockMessage(moderation) };
  }

  const slugBase = createSlug(data.title) || "creative-job";
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const manageToken = createManageToken();
  const selectedServices = knownServices
    .filter((service) => data.services.includes(service.slug))
    .map((service) => service.name);
  const serviceLabels = [...selectedServices];
  if (data.otherService?.trim()) serviceLabels.push(data.otherService.trim());

  const status: CreativeJobStatus = moderation.decision === "auto_approved" ? "open" : "pending_review";
  const { data: job, error } = await supabase
    .from("creative_job_listings")
    .insert({
      title: data.title,
      slug,
      description: data.description,
      intended_outcome: null,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      company_name: data.companyName || null,
      project_type: data.projectType,
      services: serviceLabels.length ? serviceLabels : data.services,
      service_slugs: data.services,
      other_service: data.otherService?.trim() || null,
      budget_min: data.budgetMin ?? null,
      budget_max: data.budgetMax ?? null,
      deadline: data.deadline || null,
      reference_links: data.referenceLinks || null,
      notes: data.notes || null,
      status,
      manage_token: manageToken,
      moderation_decision: moderation.decision,
      moderation_risk: moderation.risk,
      moderation_reason: moderation.reason,
      moderation_signals: moderation.signals,
    })
    .select("id, slug")
    .single();

  if (error || !job) {
    const missingTable = error?.message.toLowerCase().includes("creative_job_listings");
    return {
      ok: false,
      message: missingTable
        ? "Creative jobs need one more Supabase setup step before listings can be published."
        : error?.message ?? "Could not publish this job listing.",
    };
  }

  const uploadedReferences = [];
  for (const [index, file] of referenceFiles.entries()) {
    const caption = referenceCaptions[index] ?? "";
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "upload";
    const path = `${job.id}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("creative-job-references").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) continue;

    const { data: publicUrlData } = supabase.storage.from("creative-job-references").getPublicUrl(path);
    uploadedReferences.push({
      job_id: job.id,
      bucket: "creative-job-references",
      storage_path: path,
      file_name: file.name,
      caption: caption || null,
      file_url: publicUrlData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      sort_order: index,
    });
  }

  if (uploadedReferences.length > 0) {
    await supabase.from("creative_job_reference_files").insert(uploadedReferences);
  }

  return { ok: true, id: job.id, slug: job.slug, manageToken, status };
}

export async function updateCreativeJobStatusByToken(token: string, status: CreativeJobStatus): Promise<UpdateCreativeJobStatusResult> {
  if (!["pending_review", "open", "in_discussion", "taken"].includes(status)) {
    return { ok: false, message: "Choose a valid status." };
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, message: "Supabase is not configured for creative jobs yet." };
  }

  const { error } = await supabase
    .from("creative_job_listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("manage_token", token);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/creative-jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/creative-jobs");
  revalidatePath(`/creative-jobs/manage/${token}`);

  return { ok: true, status };
}

export async function updateCreativeJobDetailsByToken(token: string, input: unknown): Promise<UpdateCreativeJobDetailsResult> {
  const formInput = input instanceof FormData ? formDataToCreativeJobInput(input) : input;
  const parsed = creativeJobSchema.safeParse(formInput);

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
    return { ok: false, message: "Supabase is not configured for creative jobs yet." };
  }

  const data = parsed.data;
  const moderation = assessModeration({
    kind: "creative_job",
    texts: [
      data.title,
      data.description,
      data.contactName,
      data.contactEmail,
      data.companyName,
      data.projectType,
      data.otherService,
      data.referenceLinks,
      data.notes,
      ...data.services,
    ],
    linkCount: data.referenceLinks ? data.referenceLinks.split(/\s+/).filter((value) => value.startsWith("http")).length : 0,
    hasContact: Boolean(data.contactEmail),
  });

  if (moderation.decision === "blocked") {
    return { ok: false, message: moderationBlockMessage(moderation) };
  }

  const selectedServices = knownServices
    .filter((service) => data.services.includes(service.slug))
    .map((service) => service.name);
  const serviceLabels = [...selectedServices];
  if (data.otherService?.trim()) serviceLabels.push(data.otherService.trim());

  const { error } = await supabase
    .from("creative_job_listings")
    .update({
      title: data.title,
      description: data.description,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      company_name: data.companyName || null,
      project_type: data.projectType,
      services: serviceLabels.length ? serviceLabels : data.services,
      service_slugs: data.services,
      other_service: data.otherService?.trim() || null,
      budget_min: data.budgetMin ?? null,
      budget_max: data.budgetMax ?? null,
      deadline: data.deadline || null,
      reference_links: data.referenceLinks || null,
      notes: data.notes || null,
      status: moderation.decision === "auto_approved" ? "open" : "pending_review",
      moderation_decision: moderation.decision,
      moderation_risk: moderation.risk,
      moderation_reason: moderation.reason,
      moderation_signals: moderation.signals,
      updated_at: new Date().toISOString(),
    })
    .eq("manage_token", token);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/creative-jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/creative-jobs");
  revalidatePath(`/creative-jobs/manage/${token}`);

  return { ok: true };
}

export async function updateCreativeJobMediaByToken(token: string, formData: FormData): Promise<UpdateCreativeJobMediaResult> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, message: "Supabase is not configured for creative jobs yet." };
  }

  const { data: job, error: jobError } = await supabase
    .from("creative_job_listings")
    .select("id")
    .eq("manage_token", token)
    .single();

  if (jobError || !job) {
    return { ok: false, message: "This private manage link is no longer valid." };
  }

  const { data: currentReferences, error: referencesError } = await supabase
    .from("creative_job_reference_files")
    .select("id, storage_path, size_bytes")
    .eq("job_id", job.id);

  if (referencesError || !currentReferences) {
    return { ok: false, message: "Could not load the current uploads." };
  }

  const referenceRows = currentReferences as Array<{ id: string; storage_path: string; size_bytes: number }>;
  const deletedIds = new Set(formData.getAll("deletedReferenceIds").filter((value): value is string => typeof value === "string"));
  const newFiles = validReferenceFiles(formData.getAll("newReferenceFiles"));
  const newCaptions = formData.getAll("newReferenceCaptions").map((value) => stringFromFormData(value).trim());
  const keptSizeBytes = referenceRows
    .filter((reference) => !deletedIds.has(reference.id))
    .reduce((total, reference) => total + reference.size_bytes, 0);
  const newSizeBytes = newFiles.reduce((total, file) => total + file.size, 0);

  if ((keptSizeBytes + newSizeBytes) / 1024 / 1024 > 10) {
    return { ok: false, message: "Reference uploads must be 10MB total or smaller. Remove a file or upload smaller files." };
  }

  const moderation = assessModeration({
    kind: "creative_job",
    texts: [
      ...formData.getAll("referenceCaptionUpdates").map((value) => stringFromFormData(value)),
      ...newCaptions,
    ],
    filenames: newFiles.map((file) => file.name),
    hasMedia: referenceRows.length - deletedIds.size + newFiles.length > 0,
  });

  if (moderation.decision === "blocked") {
    return { ok: false, message: moderationBlockMessage(moderation) };
  }

  const captionUpdates = formData.getAll("referenceCaptionUpdates").filter((value): value is string => typeof value === "string");
  for (const update of captionUpdates) {
    const [id, ...captionParts] = update.split("::");
    if (!id || deletedIds.has(id)) continue;
    const caption = captionParts.join("::").trim();
    await supabase
      .from("creative_job_reference_files")
      .update({ caption: caption || null })
      .eq("id", id)
      .eq("job_id", job.id);
  }

  if (deletedIds.size > 0) {
    const rowsToDelete = referenceRows.filter((reference) => deletedIds.has(reference.id));
    const storagePaths = rowsToDelete.map((reference) => reference.storage_path);
    if (storagePaths.length > 0) {
      await supabase.storage.from("creative-job-references").remove(storagePaths);
    }
    await supabase.from("creative_job_reference_files").delete().eq("job_id", job.id).in("id", Array.from(deletedIds));
  }

  const remainingCount = referenceRows.filter((reference) => !deletedIds.has(reference.id)).length;
  const uploadedReferences = [];
  for (const [index, file] of newFiles.entries()) {
    const caption = newCaptions[index] ?? "";
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "upload";
    const path = `${job.id}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("creative-job-references").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from("creative-job-references").getPublicUrl(path);
    uploadedReferences.push({
      job_id: job.id,
      bucket: "creative-job-references",
      storage_path: path,
      file_name: file.name,
      caption: caption || null,
      file_url: publicUrlData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      sort_order: remainingCount + index,
    });
  }

  if (uploadedReferences.length > 0) {
    const { error: insertError } = await supabase.from("creative_job_reference_files").insert(uploadedReferences);
    if (insertError) {
      return { ok: false, message: insertError.message };
    }
  }

  await supabase
    .from("creative_job_listings")
    .update({
      status: moderation.decision === "auto_approved" ? "open" : "pending_review",
      moderation_decision: moderation.decision,
      moderation_risk: moderation.risk,
      moderation_reason: moderation.reason,
      moderation_signals: moderation.signals,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  revalidatePath("/creative-jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/creative-jobs");
  revalidatePath(`/creative-jobs/manage/${token}`);

  return { ok: true };
}

function formDataToCreativeJobInput(formData: FormData) {
  return {
    title: stringFromFormData(formData.get("title")),
    description: stringFromFormData(formData.get("description")),
    contactName: stringFromFormData(formData.get("contactName")),
    contactEmail: stringFromFormData(formData.get("contactEmail")),
    companyName: stringFromFormData(formData.get("companyName")),
    projectType: stringFromFormData(formData.get("projectType")),
    services: formData.getAll("services").filter((value): value is string => typeof value === "string"),
    otherService: stringFromFormData(formData.get("otherService")),
    budgetMin: optionalNumberString(formData.get("budgetMin")),
    budgetMax: optionalNumberString(formData.get("budgetMax")),
    deadline: stringFromFormData(formData.get("deadline")),
    referenceLinks: stringFromFormData(formData.get("referenceLinks")),
    notes: stringFromFormData(formData.get("notes")),
  };
}

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function optionalNumberString(value: FormDataEntryValue | null) {
  const text = stringFromFormData(value).trim();
  return text ? text : undefined;
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }

  return errors;
}

function validReferenceFiles(values: FormDataEntryValue[]) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"];
  return values.filter((value): value is File => value instanceof File && value.size > 0 && allowed.includes(value.type));
}

function createManageToken() {
  return randomBytes(24).toString("hex");
}
