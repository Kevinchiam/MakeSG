"use server";

import { createSlug } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { businessSchema } from "@/lib/validation";

type SubmitBusinessResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export async function submitBusinessForApproval(input: unknown): Promise<SubmitBusinessResult> {
  const parsed = businessSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields and try again." };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, message: "Supabase is not configured for business submissions yet." };
  }

  const data = parsed.data;
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

  if (data.services.length > 0) {
    const { data: serviceRows } = await supabase.from("services").select("id, slug").in("slug", data.services);
    const joins = (serviceRows ?? []).map((service) => ({
      business_id: business.id,
      service_id: service.id,
    }));

    if (joins.length > 0) {
      await supabase.from("business_services").insert(joins);
    }
  }

  if (data.materials.length > 0) {
    const materialSlugs = data.materials.map((name) => createSlug(name));
    const { data: materialRows } = await supabase.from("materials").select("id, slug").in("slug", materialSlugs);
    const joins = (materialRows ?? []).map((material) => ({
      business_id: business.id,
      material_id: material.id,
    }));

    if (joins.length > 0) {
      await supabase.from("business_materials").insert(joins);
    }
  }

  return { ok: true, id: business.id };
}
