"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { services as knownServices } from "@/lib/data";
import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { businessSchema } from "@/lib/validation";

type SubmitBusinessResult =
  | { ok: true; id: string; manageToken: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type UpdateBusinessResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

type UpdateBusinessMediaResult =
  | { ok: true }
  | { ok: false; message: string };

type EndorseBusinessResult =
  | { ok: true; endorsementCount: number }
  | { ok: false; message: string };

export async function endorseBusiness(businessId: string): Promise<EndorseBusinessResult> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, message: "Supabase is not configured for endorsements yet." };
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("endorsement_count")
    .eq("id", businessId)
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Could not find that business." };
  }

  const endorsementCount = Number(data.endorsement_count ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("businesses")
    .update({ endorsement_count: endorsementCount, updated_at: new Date().toISOString() })
    .eq("id", businessId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  return { ok: true, endorsementCount };
}

export async function submitBusinessForApproval(input: unknown): Promise<SubmitBusinessResult> {
  const formInput = input instanceof FormData ? formDataToBusinessInput(input) : input;
  const parsed = businessSchema.safeParse(formInput);

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
    return { ok: false, message: "Supabase is not configured for business submissions yet." };
  }

  const data = parsed.data;
  const portfolioFiles = input instanceof FormData ? validPortfolioFiles(input.getAll("portfolioFiles")) : [];
  const portfolioCaptions = input instanceof FormData ? input.getAll("portfolioCaptions").map((value) => stringFromFormData(value).trim()) : [];
  const totalPortfolioSizeMb = portfolioFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024;
  if (totalPortfolioSizeMb > 10) {
    return { ok: false, message: "Portfolio uploads must be 10MB total or smaller." };
  }
  const slugBase = createSlug(data.name) || "business";
  const slug = `${slugBase}-${Date.now().toString(36)}`;
  const manageToken = createManageToken();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name: data.name,
      slug,
      short_description: data.shortDescription,
      description: data.description,
      website_url: data.websiteUrl,
      public_email: data.publicEmail,
      address: data.location,
      minimum_budget: data.minimumBudget,
      typical_lead_time: data.typicalLeadTime,
      business_type: data.businessType,
      publication_status: "pending",
      verification_status: "unverified",
      claimed: false,
      featured: false,
      manage_token: manageToken,
    })
    .select("id")
    .single();

  if (businessError || !business) {
    return { ok: false, message: businessError?.message ?? "Could not submit this listing." };
  }

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

  if (serviceSlugs.length > 0) {
    await upsertKnownServices(serviceSlugs);
    const { data: serviceRows } = await supabase.from("services").select("id, slug").in("slug", serviceSlugs);
    const joins = (serviceRows ?? []).map((service) => ({
      business_id: business.id,
      service_id: service.id,
    }));

    if (joins.length > 0) {
      await supabase.from("business_services").insert(joins);
    }
  }

  const uploadedItems = [];
  for (const [index, file] of portfolioFiles.entries()) {
    const caption = portfolioCaptions[index] ?? "";
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "upload";
    const path = `${business.id}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("business-portfolios").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) continue;

    const { data: publicUrlData } = supabase.storage.from("business-portfolios").getPublicUrl(path);
    uploadedItems.push({
      business_id: business.id,
      title: caption || file.name.replace(/\.[^/.]+$/, ""),
      description: "",
      image_url: publicUrlData.publicUrl,
      tags: [file.type],
      file_name: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
      sort_order: index,
    });
  }

  if (uploadedItems.length > 0) {
    await supabase.from("portfolio_items").insert(uploadedItems);
    const firstImage = uploadedItems.find((item) => item.tags[0]?.startsWith("image/"));
    if (firstImage) {
      await supabase.from("businesses").update({ hero_image_url: firstImage.image_url }).eq("id", business.id);
    }
  }

  return { ok: true, id: business.id, manageToken };

  async function upsertKnownServices(slugs: string[]) {
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
}

export async function updateBusinessDetailsByToken(token: string, input: unknown): Promise<UpdateBusinessResult> {
  const formInput = input instanceof FormData ? formDataToBusinessInput(input) : input;
  const parsed = businessSchema.safeParse(formInput);

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
    return { ok: false, message: "Supabase is not configured for business edits yet." };
  }

  const data = parsed.data;
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("manage_token", token)
    .single();

  if (businessError || !business) {
    return { ok: false, message: "This private business edit link is no longer valid." };
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      name: data.name,
      short_description: data.shortDescription,
      description: data.description,
      website_url: data.websiteUrl,
      public_email: data.publicEmail,
      address: data.location,
      minimum_budget: data.minimumBudget,
      typical_lead_time: data.typicalLeadTime,
      business_type: data.businessType,
      publication_status: "pending",
      verification_status: "unverified",
      updated_at: new Date().toISOString(),
    })
    .eq("id", business.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

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

  await supabase.from("business_services").delete().eq("business_id", business.id);
  if (serviceSlugs.length > 0) {
    await upsertKnownServices(supabase, serviceSlugs);
    const { data: serviceRows } = await supabase.from("services").select("id, slug").in("slug", serviceSlugs);
    const joins = (serviceRows ?? []).map((service) => ({
      business_id: business.id,
      service_id: service.id,
    }));

    if (joins.length > 0) {
      await supabase.from("business_services").insert(joins);
    }
  }

  revalidateBusinessPaths(token, business.id);
  return { ok: true };
}

export async function updateBusinessMediaByToken(token: string, formData: FormData): Promise<UpdateBusinessMediaResult> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, message: "Supabase is not configured for business edits yet." };
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("manage_token", token)
    .single();

  if (businessError || !business) {
    return { ok: false, message: "This private business edit link is no longer valid." };
  }

  const { data: currentItems, error: itemsError } = await supabase
    .from("portfolio_items")
    .select("id, image_url, storage_path, size_bytes")
    .eq("business_id", business.id);

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
      .update({ title: caption || "Submitted portfolio media", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("business_id", business.id);
  }

  if (deletedIds.size > 0) {
    const rowsToDelete = itemRows.filter((item) => deletedIds.has(item.id));
    const storagePaths = rowsToDelete
      .map((item) => item.storage_path ?? storagePathFromPublicUrl(item.image_url))
      .filter((path): path is string => Boolean(path));
    if (storagePaths.length > 0) {
      await supabase.storage.from("business-portfolios").remove(storagePaths);
    }
    await supabase.from("portfolio_items").delete().eq("business_id", business.id).in("id", Array.from(deletedIds));
  }

  const remainingCount = itemRows.filter((item) => !deletedIds.has(item.id)).length;
  const uploadedItems = [];
  for (const [index, file] of newFiles.entries()) {
    const caption = newCaptions[index] ?? "";
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "upload";
    const path = `${business.id}/${Date.now()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("business-portfolios").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return { ok: false, message: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from("business-portfolios").getPublicUrl(path);
    uploadedItems.push({
      business_id: business.id,
      title: caption || file.name.replace(/\.[^/.]+$/, ""),
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

  const { data: firstImage } = await supabase
    .from("portfolio_items")
    .select("image_url, tags")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true })
    .limit(10);
  const heroImage = (firstImage ?? []).find((item) => Array.isArray(item.tags) && item.tags[0]?.startsWith("image/"))?.image_url ?? null;

  await supabase
    .from("businesses")
    .update({
      hero_image_url: heroImage,
      publication_status: "pending",
      verification_status: "unverified",
      updated_at: new Date().toISOString(),
    })
    .eq("id", business.id);

  revalidateBusinessPaths(token, business.id);
  return { ok: true };
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

function formDataToBusinessInput(formData: FormData) {
  return {
    name: stringFromFormData(formData.get("name")),
    shortDescription: stringFromFormData(formData.get("shortDescription")),
    description: stringFromFormData(formData.get("description")),
    websiteUrl: stringFromFormData(formData.get("websiteUrl")),
    publicEmail: stringFromFormData(formData.get("publicEmail")),
    location: stringFromFormData(formData.get("location")),
    minimumBudget: stringFromFormData(formData.get("minimumBudget")),
    typicalLeadTime: stringFromFormData(formData.get("typicalLeadTime")),
    businessType: stringFromFormData(formData.get("businessType")),
    services: formData.getAll("services").filter((value): value is string => typeof value === "string"),
    otherService: stringFromFormData(formData.get("otherService")),
  };
}

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }

  return errors;
}

function validPortfolioFiles(values: FormDataEntryValue[]) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"];
  return values.filter((value): value is File => value instanceof File && value.size > 0 && allowed.includes(value.type));
}

function createManageToken() {
  return randomBytes(24).toString("hex");
}

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null;
  const marker = "/object/public/business-portfolios/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

function revalidateBusinessPaths(token: string, businessId: string) {
  revalidatePath("/businesses");
  revalidatePath("/admin");
  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath(`/businesses/manage/${token}`);
}
