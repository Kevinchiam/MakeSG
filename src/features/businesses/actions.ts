"use server";

import { z } from "zod";
import { services as knownServices } from "@/lib/data";
import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { businessSchema } from "@/lib/validation";

type SubmitBusinessResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

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
  const totalPortfolioSizeMb = portfolioFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024;
  if (totalPortfolioSizeMb > 10) {
    return { ok: false, message: "Portfolio uploads must be 10MB total or smaller." };
  }
  const slugBase = createSlug(data.name) || "business";
  const slug = `${slugBase}-${Date.now().toString(36)}`;

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
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: file.type.startsWith("video/") ? "Submitted portfolio video." : "Submitted portfolio photo.",
      image_url: publicUrlData.publicUrl,
      tags: [file.type],
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

  return { ok: true, id: business.id };

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
