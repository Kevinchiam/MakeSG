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
  const slugBase = createSlug(data.title) || "creative-job";
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const selectedServices = knownServices
    .filter((service) => data.services.includes(service.slug))
    .map((service) => service.name);

  const { data: job, error } = await supabase
    .from("creative_job_listings")
    .insert({
      title: data.title,
      slug,
      description: data.description,
      intended_outcome: data.intendedOutcome,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      company_name: data.companyName || null,
      project_type: data.projectType,
      services: selectedServices.length ? selectedServices : data.services,
      service_slugs: data.services,
      budget_min: data.budgetMin ?? null,
      budget_max: data.budgetMax ?? null,
      deadline: data.deadline || null,
      preferred_location: data.preferredLocation || null,
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
        ? "The creative job listings database table has not been added yet."
        : error?.message ?? "Could not publish this job listing.",
    };
  }

  return { ok: true, id: job.id, slug: job.slug };
}

function formDataToCreativeJobInput(formData: FormData) {
  return {
    title: stringFromFormData(formData.get("title")),
    description: stringFromFormData(formData.get("description")),
    intendedOutcome: stringFromFormData(formData.get("intendedOutcome")),
    contactName: stringFromFormData(formData.get("contactName")),
    contactEmail: stringFromFormData(formData.get("contactEmail")),
    companyName: stringFromFormData(formData.get("companyName")),
    projectType: stringFromFormData(formData.get("projectType")),
    services: formData.getAll("services").filter((value): value is string => typeof value === "string"),
    budgetMin: optionalNumberString(formData.get("budgetMin")),
    budgetMax: optionalNumberString(formData.get("budgetMax")),
    deadline: stringFromFormData(formData.get("deadline")),
    preferredLocation: stringFromFormData(formData.get("preferredLocation")),
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
