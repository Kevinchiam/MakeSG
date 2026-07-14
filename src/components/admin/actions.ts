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
