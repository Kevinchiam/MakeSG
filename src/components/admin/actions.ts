"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminTrashKind } from "@/lib/admin-trash";
import type { PublicationStatus } from "@/lib/types";
import { services as knownServices } from "@/lib/data";
import { smartMediaCaption } from "@/lib/media-captions";
import { businessSchema } from "@/lib/validation";

type AdminBusinessUpdateResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type AdminBusinessMediaUpdateResult =
  | { ok: true }
  | { ok: false; message: string };

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
  revalidatePath("/admin/trash");
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
  revalidatePath("/admin/trash");
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
  revalidatePath("/admin/trash");
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
  revalidatePath("/admin/trash");

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function updateBusinessFromAdmin(businessId: string, formData: FormData): Promise<AdminBusinessUpdateResult> {
  const parsed = businessSchema.safeParse(formDataToBusinessInput(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", businessId)
    .single();

  const serviceSlugs = [...data.services];
  if (data.otherService?.trim()) {
    const otherSlug = `other-${createSlug(data.otherService)}`;
    serviceSlugs.push(otherSlug);
    await supabase.from("services").upsert(
      {
        slug: otherSlug,
        name: data.otherService.trim(),
        description: "Community-submitted service.",
        service_group: "Other",
      },
      { onConflict: "slug" },
    );
  }

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
      updated_at: new Date().toISOString(),
    })
    .eq("id", businessId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await supabase.from("business_services").delete().eq("business_id", businessId);
  if (serviceSlugs.length > 0) {
    await upsertKnownServices(supabase, serviceSlugs);
    const { data: serviceRows } = await supabase.from("services").select("id, slug").in("slug", serviceSlugs);
    const joins = (serviceRows ?? []).map((service) => ({
      business_id: businessId,
      service_id: service.id,
    }));

    if (joins.length > 0) {
      const { error: joinError } = await supabase.from("business_services").insert(joins);
      if (joinError) return { ok: false, message: joinError.message };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/businesses");
  if (business?.slug) revalidatePath(`/businesses/${business.slug}`);

  return { ok: true };
}

export async function updateBusinessMediaFromAdmin(businessId: string, formData: FormData): Promise<AdminBusinessMediaUpdateResult> {
  const supabase = createAdminClient();
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug")
    .eq("id", businessId)
    .single();

  if (businessError || !business) {
    return { ok: false, message: "Could not find this business listing." };
  }

  const { data: currentItems, error: itemsError } = await supabase
    .from("portfolio_items")
    .select("id, image_url, storage_path, size_bytes")
    .eq("business_id", businessId);

  if (itemsError || !currentItems) {
    return { ok: false, message: "Could not load the current portfolio uploads." };
  }

  const itemRows = currentItems as Array<{ id: string; image_url: string | null; storage_path: string | null; size_bytes: number | null }>;
  const deletedIds = new Set(formData.getAll("deletedPortfolioIds").filter((value): value is string => typeof value === "string"));
  const newFiles = validPortfolioFiles(formData.getAll("newPortfolioFiles"));
  const newCaptions = formData.getAll("newPortfolioCaptions").map((value) => stringFromFormData(value).trim());
  const keptSizeBytes = itemRows
    .filter((item) => !deletedIds.has(item.id))
    .reduce((total, item) => total + (item.size_bytes ?? 0), 0);
  const newSizeBytes = newFiles.reduce((total, file) => total + file.size, 0);

  if ((keptSizeBytes + newSizeBytes) / 1024 / 1024 > 10) {
    return { ok: false, message: "Portfolio uploads must be 10MB total or smaller. Remove a file or upload smaller files." };
  }

  const captionUpdates = formData.getAll("portfolioCaptionUpdates").filter((value): value is string => typeof value === "string");
  for (const update of captionUpdates) {
    const [id, ...captionParts] = update.split("::");
    if (!id || deletedIds.has(id)) continue;
    const caption = captionParts.join("::").trim();
    await supabase
      .from("portfolio_items")
      .update({
        title: smartMediaCaption({ caption, fallback: `${business.name} portfolio` }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("business_id", businessId);
  }

  if (deletedIds.size > 0) {
    const rowsToDelete = itemRows.filter((item) => deletedIds.has(item.id));
    const storagePaths = rowsToDelete
      .map((item) => item.storage_path ?? storagePathFromPublicUrl(item.image_url))
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      await supabase.storage.from("business-portfolios").remove(storagePaths);
    }

    await supabase.from("portfolio_items").delete().eq("business_id", businessId).in("id", Array.from(deletedIds));
  }

  const remainingCount = itemRows.filter((item) => !deletedIds.has(item.id)).length;
  const uploadedItems = [];
  for (const [index, file] of newFiles.entries()) {
    const caption = smartMediaCaption({
      caption: newCaptions[index],
      fileName: file.name,
      fallback: `${business.name} portfolio`,
      mediaKind: file.type.startsWith("video/") ? "video" : "photo",
    });
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "upload";
    const path = `${businessId}/admin-${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("business-portfolios").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from("business-portfolios").getPublicUrl(path);
    uploadedItems.push({
      business_id: businessId,
      title: caption,
      description: "",
      image_url: publicUrlData.publicUrl,
      tags: [file.type],
      file_name: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
      sort_order: remainingCount + index,
    });
  }

  if (uploadedItems.length > 0) {
    const { error: insertError } = await supabase.from("portfolio_items").insert(uploadedItems);
    if (insertError) {
      return { ok: false, message: insertError.message };
    }
  }

  const { data: images } = await supabase
    .from("portfolio_items")
    .select("image_url, tags, mime_type")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true })
    .limit(20);
  const heroImage = (images ?? []).find((item) => {
    const mimeType = item.mime_type ?? (Array.isArray(item.tags) ? item.tags[0] : "");
    return mimeType?.startsWith("image/");
  })?.image_url ?? null;

  await supabase
    .from("businesses")
    .update({ hero_image_url: heroImage, updated_at: new Date().toISOString() })
    .eq("id", businessId);

  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/businesses");
  if (business.slug) revalidatePath(`/businesses/${business.slug}`);

  return { ok: true };
}

export async function deleteCreativeJobEntry(jobId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("creative_job_listings").delete().eq("id", jobId);

  revalidatePath("/creative-jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/creative-jobs");
  revalidatePath("/admin/trash");

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
  revalidatePath("/admin/trash");

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function restoreTrashItem(kind: AdminTrashKind, id: string) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  let result: { error: { message: string } | null };

  switch (kind) {
    case "business":
      result = await supabase
        .from("businesses")
        .update({ publication_status: "pending", updated_at: now })
        .eq("id", id)
        .eq("publication_status", "rejected");
      break;
    case "business_edit":
      result = await supabase
        .from("business_listing_revisions")
        .update({ status: "pending", updated_at: now })
        .eq("id", id)
        .eq("status", "rejected");
      break;
    case "recommendation":
      result = await supabase
        .from("business_recommendations")
        .update({ status: "pending", updated_at: now })
        .eq("id", id)
        .eq("status", "rejected");
      break;
    case "creative_job":
      result = await supabase
        .from("creative_job_listings")
        .update({ status: "pending_review", updated_at: now })
        .eq("id", id)
        .eq("status", "archived");
      break;
    case "change_request":
      result = await supabase
        .from("business_change_requests")
        .update({ status: "pending", updated_at: now })
        .eq("id", id)
        .eq("status", "dismissed");
      break;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/trash");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/recommendations");
  revalidatePath("/admin/creative-jobs");
  revalidatePath("/admin/change-requests");
  revalidatePath("/businesses");
  revalidatePath("/creative-jobs");

  if (result.error) {
    return { ok: false, message: result.error.message };
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

function validPortfolioFiles(values: FormDataEntryValue[]) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"];
  return values.filter((value): value is File => value instanceof File && value.size > 0 && allowed.includes(value.type));
}

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null;
  const marker = "/object/public/business-portfolios/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

function formDataToBusinessInput(formData: FormData) {
  return {
    name: stringFromFormData(formData.get("name")),
    shortDescription: stringFromFormData(formData.get("shortDescription")),
    description: stringFromFormData(formData.get("description")),
    websiteUrl: stringFromFormData(formData.get("websiteUrl")),
    publicEmail: stringFromFormData(formData.get("publicEmail")),
    phoneNumber: stringFromFormData(formData.get("phoneNumber")),
    location: stringFromFormData(formData.get("location")),
    minimumBudget: stringFromFormData(formData.get("minimumBudget")),
    typicalLeadTime: stringFromFormData(formData.get("typicalLeadTime")),
    businessType: stringFromFormData(formData.get("businessType")),
    services: formData.getAll("services").filter((value): value is string => typeof value === "string"),
    otherService: stringFromFormData(formData.get("otherService")),
  };
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }

  return errors;
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

async function upsertKnownServices(supabase: ReturnType<typeof createAdminClient>, slugs: string[]) {
  const selectedServices = knownServices
    .filter((service) => slugs.includes(service.slug))
    .map((service) => ({
      slug: service.slug,
      name: service.name,
      description: service.description,
      service_group: service.group,
    }));

  if (selectedServices.length > 0) {
    await supabase.from("services").upsert(selectedServices, { onConflict: "slug" });
  }
}

function revalidateBusinessAdminPaths(businessId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath("/businesses");
}
