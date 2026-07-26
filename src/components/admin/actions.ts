"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicationStatus } from "@/lib/types";

export async function updateBusinessPublicationStatus(businessId: string, status: PublicationStatus) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("businesses")
    .update({ publication_status: status, updated_at: new Date().toISOString() })
    .eq("id", businessId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/businesses");
  return { ok: true };
}

export async function deleteBusinessEntry(businessId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("businesses").delete().eq("id", businessId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/businesses");
  return { ok: true };
}

export async function updateCreativeJobFromForm(jobId: string, formData: FormData) {
  const supabase = createAdminClient();
  const services = formData.getAll("services").filter((value): value is string => typeof value === "string");
  const { error } = await supabase
    .from("creative_job_listings")
    .update({
      title: stringFromFormData(formData.get("title")),
      description: stringFromFormData(formData.get("description")),
      contact_name: stringFromFormData(formData.get("contactName")),
      contact_email: stringFromFormData(formData.get("contactEmail")),
      company_name: nullableStringFromFormData(formData.get("companyName")),
      project_type: stringFromFormData(formData.get("projectType")),
      services,
      budget_min: nullableNumberFromFormData(formData.get("budgetMin")),
      budget_max: nullableNumberFromFormData(formData.get("budgetMax")),
      deadline: nullableStringFromFormData(formData.get("deadline")),
      preferred_location: nullableStringFromFormData(formData.get("preferredLocation")),
      notes: nullableStringFromFormData(formData.get("notes")),
      status: stringFromFormData(formData.get("status")) || "open",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  revalidatePath("/creative-jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/creative-jobs");
  revalidatePath(`/admin/creative-jobs/${jobId}`);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function deleteCreativeJobEntry(jobId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("creative_job_listings").delete().eq("id", jobId);

  revalidatePath("/creative-jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/creative-jobs");

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function nullableStringFromFormData(value: FormDataEntryValue | null) {
  const text = stringFromFormData(value).trim();
  return text || null;
}

function nullableNumberFromFormData(value: FormDataEntryValue | null) {
  const text = stringFromFormData(value).trim();
  return text ? Number(text) : null;
}
