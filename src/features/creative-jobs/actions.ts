"use server";

import { z } from "zod";
import { services as knownServices } from "@/lib/data";
import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { creativeJobSchema } from "@/lib/validation";

type SubmitCreativeJobResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

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

  const slugBase = createSlug(data.title) || "creative-job";
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const selectedServices = knownServices
    .filter((service) => data.services.includes(service.slug))
    .map((service) => service.name);
  const serviceLabels = [...selectedServices];
  if (data.otherService?.trim()) serviceLabels.push(data.otherService.trim());

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
      status: "open",
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

  return { ok: true, id: job.id, slug: job.slug };
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
