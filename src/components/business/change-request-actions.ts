"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { smartMediaCaption } from "@/lib/media-captions";
import { assessModeration, moderationBlockMessage } from "@/lib/moderation";
import { createAdminClient } from "@/lib/supabase/admin";

type ChangeRequestResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const changeRequestSchema = z.object({
  businessId: z.string().min(1),
  requesterEmail: z.string().email("Use a valid email address."),
  reason: z.string().min(20, "Describe the requested change in at least 20 characters."),
});

const mediaTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]);

type UploadedChangeRequestMedia = {
  change_request_id: string;
  bucket: "business-portfolios";
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  caption: string;
  sort_order: number;
};

export async function requestBusinessChange(formData: FormData): Promise<ChangeRequestResult> {
  const mediaFiles = validMediaFiles(formData.getAll("changeRequestMedia"));
  const invalidMedia = formData.getAll("changeRequestMedia").some((value) => {
    return typeof value !== "string" && value.size > 0 && !mediaTypes.has(value.type);
  });
  const mediaCaptions = formData.getAll("changeRequestMediaCaptions").map((value) => stringFromFormData(value).trim());
  const totalSizeMb = mediaFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024;

  if (invalidMedia) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: { media: "Upload JPG, PNG, WebP, MP4, MOV or WebM files only." },
    };
  }

  if (totalSizeMb > 10) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: { media: "Supporting photos or videos must be 10MB total or smaller." },
    };
  }

  const parsed = changeRequestSchema.safeParse({
    businessId: formData.get("businessId"),
    requesterEmail: formData.get("requesterEmail"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
    };
  }

  const moderation = assessModeration({
    kind: "change_request",
    texts: [parsed.data.requesterEmail, parsed.data.reason, ...mediaCaptions],
    filenames: mediaFiles.map((file) => file.name),
    hasContact: Boolean(parsed.data.requesterEmail),
    hasMedia: mediaFiles.length > 0,
  });

  if (moderation.decision === "blocked") {
    return { ok: false, message: moderationBlockMessage(moderation) };
  }

  try {
    const supabase = createAdminClient();
    const { data: request, error } = await supabase
      .from("business_change_requests")
      .insert({
        business_id: parsed.data.businessId,
        requester_email: parsed.data.requesterEmail,
        reason: parsed.data.reason,
        status: "open",
        moderation_decision: moderation.decision,
        moderation_risk: moderation.risk,
        moderation_reason: moderation.reason,
        moderation_signals: moderation.signals,
      })
      .select("id")
      .single();

    if (error || !request) {
      return { ok: false, message: error?.message ?? "The change request could not be saved. Please try again." };
    }

    const uploadedMedia: UploadedChangeRequestMedia[] = [];
    for (const [index, file] of mediaFiles.entries()) {
      const extension = extensionFromFile(file);
      const path = `change-requests/${request.id}/${Date.now()}-${index}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("business-portfolios")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        const uploadedPaths = uploadedMedia.map((item) => item.storage_path);
        if (uploadedPaths.length) await supabase.storage.from("business-portfolios").remove(uploadedPaths);
        await supabase.from("business_change_requests").delete().eq("id", request.id);
        return { ok: false, message: uploadError.message, fieldErrors: { media: "The media could not be uploaded. Try smaller files or remove one file." } };
      }

      uploadedMedia.push({
        change_request_id: request.id,
        bucket: "business-portfolios",
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        caption: smartMediaCaption({
          caption: mediaCaptions[index],
          fileName: file.name,
          fallback: "Suggested listing change",
          mediaKind: file.type.startsWith("video/") ? "video" : "photo",
        }),
        sort_order: index,
      });
    }

    if (uploadedMedia.length > 0) {
      const { error: mediaError } = await supabase.from("business_change_request_media").insert(uploadedMedia);
      if (mediaError) {
        await supabase.storage.from("business-portfolios").remove(uploadedMedia.map((item) => item.storage_path));
        await supabase.from("business_change_requests").delete().eq("id", request.id);
        return { ok: false, message: mediaError.message };
      }
    }
  } catch (error) {
    console.error("[business-change-request-failed]", error);
    return { ok: false, message: "Change requests are not available yet. Please try again after the admin database is updated." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/change-requests");
  return { ok: true, message: "Change request saved for MakeSG admin review." };
}

function validMediaFiles(values: FormDataEntryValue[]) {
  return values.filter((value): value is File => {
    return typeof value !== "string" && value.size > 0 && mediaTypes.has(value.type);
  });
}

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function extensionFromFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension) return extension.replace(/[^a-z0-9]/g, "") || "bin";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/webm") return "webm";
  return "bin";
}

function fieldErrorsFromIssues(issues: z.ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
