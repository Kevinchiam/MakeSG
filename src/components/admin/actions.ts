"use server";

import { revalidatePath } from "next/cache";
import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicationStatus } from "@/lib/types";
import { services as knownServices } from "@/lib/data";

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

export async function approvePendingBusinessRevision(businessId: string) {
  const supabase = createAdminClient();
  const { data: revision, error: revisionError } = await supabase
    .from("business_listing_revisions")
    .select("id, proposed_data, proposed_services, proposed_portfolio")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .single();

  if (revisionError || !revision) {
    return { ok: false, message: revisionError?.message ?? "No pending edits were found." };
  }

  const data = revision.proposed_data as {
    name: string;
    shortDescription: string;
    description: string;
    websiteUrl?: string;
    publicEmail?: string;
    phoneNumber?: string;
    location?: string;
    minimumBudget?: number;
    typicalLeadTime?: number;
    businessType: string;
  };
  const proposedServices = (revision.proposed_services ?? []) as string[];
  const proposedPortfolio = (revision.proposed_portfolio ?? []) as Array<{
    title: string;
    description?: string;
    imageUrl: string;
    tags?: string[];
    fileName?: string;
    storagePath?: string;
    mimeType?: string;
    sizeBytes?: number;
  }>;

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      name: data.name,
      short_description: data.shortDescription,
      description: data.description,
      website_url: data.websiteUrl ?? null,
      public_email: data.publicEmail ?? null,
      public_phone: data.phoneNumber ?? null,
      address: data.location ?? null,
      minimum_budget: data.minimumBudget ?? 0,
      typical_lead_time: data.typicalLeadTime ?? 0,
      business_type: data.businessType,
      publication_status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await supabase.from("business_services").delete().eq("business_id", businessId);
  const serviceSlugs = await ensureServicesByName(supabase, proposedServices);
  if (serviceSlugs.length > 0) {
    const { data: serviceRows } = await supabase.from("services").select("id, slug").in("slug", serviceSlugs);
    const joins = (serviceRows ?? []).map((service) => ({ business_id: businessId, service_id: service.id }));
    if (joins.length > 0) await supabase.from("business_services").insert(joins);
  }

  await supabase.from("portfolio_items").delete().eq("business_id", businessId);
  const portfolioRows = proposedPortfolio.map((item, index) => ({
    business_id: businessId,
    title: item.title,
    description: item.description ?? "",
    image_url: item.imageUrl,
    tags: item.tags ?? [],
    file_name: item.fileName ?? null,
    storage_path: item.storagePath ?? null,
    mime_type: item.mimeType ?? item.tags?.[0] ?? null,
    size_bytes: item.sizeBytes ?? null,
    sort_order: index,
  }));

  if (portfolioRows.length > 0) {
    await supabase.from("portfolio_items").insert(portfolioRows);
  }

  const heroImage = proposedPortfolio.find((item) => (item.mimeType ?? item.tags?.[0] ?? "").startsWith("image/"))?.imageUrl ?? null;
  await supabase.from("businesses").update({ hero_image_url: heroImage }).eq("id", businessId);

  await supabase
    .from("business_listing_revisions")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", revision.id);

  revalidateBusinessAdminPaths(businessId);
  return { ok: true };
}

export async function rejectPendingBusinessRevision(businessId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("business_listing_revisions")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("status", "pending");

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateBusinessAdminPaths(businessId);
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

export async function updateBusinessRecommendationStatus(recommendationId: string, status: "approved" | "rejected") {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("business_recommendations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", recommendationId)
    .select("businesses(slug)")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  const business = Array.isArray(data?.businesses) ? data.businesses[0] : data?.businesses;
  revalidatePath("/admin");
  revalidatePath("/admin/recommendations");
  if (business?.slug) revalidatePath(`/businesses/${business.slug}`);
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

export async function updateBusinessChangeRequestStatus(requestId: string, status: "reviewed" | "dismissed", adminNotes?: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("business_change_requests")
    .update({
      status,
      admin_notes: adminNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  revalidatePath("/admin");
  revalidatePath("/admin/change-requests");

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

async function ensureServicesByName(supabase: ReturnType<typeof createAdminClient>, names: string[]) {
  const serviceRows = [];

  for (const name of names) {
    const known = knownServices.find((service) => service.name === name);
    if (known) {
      serviceRows.push({
        slug: known.slug,
        name: known.name,
        description: known.description,
        service_group: known.group,
      });
      continue;
    }

    const slug = `other-${createSlug(name)}`;
    serviceRows.push({
      slug,
      name,
      description: "Community-submitted service.",
      service_group: "Other",
    });
  }

  if (serviceRows.length > 0) {
    await supabase.from("services").upsert(serviceRows, { onConflict: "slug" });
  }

  return serviceRows.map((service) => service.slug);
}

function revalidateBusinessAdminPaths(businessId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/businesses");
}
