"use client";

import { ImageIcon, Save, Trash2, Video } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { updateBusinessRecommendationFromAdmin } from "@/components/admin/actions";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminBusinessRecommendation } from "@/lib/business-recommendations";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

export function AdminRecommendationEditForm({ recommendation }: { recommendation: AdminBusinessRecommendation }) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newCaptions, setNewCaptions] = useState<Record<string, string>>({});
  const [captionUpdates, setCaptionUpdates] = useState<Record<string, string>>(
    Object.fromEntries((recommendation.mediaItems ?? []).map((item) => [item.id, item.caption])),
  );
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const visibleMedia = (recommendation.mediaItems ?? []).filter((item) => !deletedIds.includes(item.id));
  useFeedbackFocus(messageRef, message);

  async function saveRecommendation(formData: FormData) {
    setIsSaving(true);
    setMessage(null);
    setFieldErrors({});

    deletedIds.forEach((id) => formData.append("deletedRecommendationMediaIds", id));
    Object.entries(captionUpdates).forEach(([id, caption]) => formData.append("recommendationMediaCaptionUpdates", `${id}::${caption}`));
    newFiles.forEach((file) => {
      formData.append("newRecommendationMediaFiles", file);
      formData.append("newRecommendationMediaCaptions", newCaptions[fileKey(file)] ?? "");
    });

    const result = await updateBusinessRecommendationFromAdmin(recommendation.id, formData);
    setIsSaving(false);

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {});
      setMessage({ tone: "error", text: result.message ?? "Could not save this recommendation." });
      return;
    }

    setDeletedIds([]);
    setNewFiles([]);
    setNewCaptions({});
    setMessage({ tone: "success", text: "Recommendation updated." });
  }

  return (
    <details className="mt-5 border border-[#ded8cc] bg-[#fbfaf7] p-4">
      <summary className="cursor-pointer text-sm font-semibold">Edit recommendation</summary>
      <form action={saveRecommendation} className="mt-4 grid gap-5">
        {message ? (
          <p
            ref={messageRef}
            tabIndex={-1}
            className={`border p-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`}
            role={message.tone === "error" ? "alert" : "status"}
          >
            {message.text}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Recommended by" error={fieldErrors.recommenderName}>
            <Input name="recommenderName" defaultValue={recommendation.recommenderName} required />
          </Field>
          <Field label="Private email" error={fieldErrors.recommenderEmail}>
            <Input name="recommenderEmail" type="email" defaultValue={recommendation.recommenderEmail ?? ""} />
          </Field>
          <Field label="Role or relationship note" error={fieldErrors.recommenderRole}>
            <Input name="recommenderRole" defaultValue={recommendation.recommenderRole ?? ""} />
          </Field>
          <Field label="Name display">
            <label className="flex min-h-11 items-center gap-2 border border-[#ded8cc] bg-white px-3 text-sm font-normal">
              <input type="checkbox" name="permissionToPublishName" defaultChecked={recommendation.permissionToPublishName} />
              Contributor name can be public
            </label>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <RatingField name="qualityRating" label="Quality" value={recommendation.qualityRating} error={fieldErrors.qualityRating} />
          <RatingField name="reliabilityRating" label="Reliability" value={recommendation.reliabilityRating} error={fieldErrors.reliabilityRating} />
          <RatingField name="collaborationRating" label="Collaboration" value={recommendation.collaborationRating} error={fieldErrors.collaborationRating} />
        </div>

        <Field label="Short review" error={fieldErrors.comment}>
          <Textarea name="comment" defaultValue={recommendation.comment} required />
        </Field>

        <Field label="Supporting links" error={fieldErrors.supportingLinks}>
          <Textarea
            name="supportingLinks"
            defaultValue={(recommendation.supportingLinks ?? []).join("\n")}
            placeholder="One link per line, up to three"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="permissionToContact" defaultChecked={recommendation.permissionToContact} />
          Admin may contact this contributor privately if needed.
        </label>

        <section className="grid gap-4">
          <div>
            <p className="text-sm font-semibold">Recommendation media</p>
            <p className="mt-1 text-sm leading-6 text-[#6d675d]">Change captions, remove unsuitable uploads, or add replacement photos and videos.</p>
          </div>
          {visibleMedia.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleMedia.map((media) => (
                <article key={media.id} className="border border-[#ded8cc] bg-white p-3">
                  <ExistingMediaPreview media={media} />
                  <label className="mt-3 grid gap-1.5 text-sm font-medium">
                    Caption
                    <Input
                      value={captionUpdates[media.id] ?? ""}
                      onChange={(event) => setCaptionUpdates((current) => ({ ...current, [media.id]: event.target.value }))}
                      placeholder="Describe this photo or video"
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-3"
                    onClick={() => setDeletedIds((current) => [...current, media.id])}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-[#ded8cc] bg-white p-4 text-sm text-[#6d675d]">No media will remain unless you add new uploads below.</p>
          )}

          <FileUploader
            accept="media"
            maxTotalSizeMb={10}
            value={newFiles}
            onFilesChange={(files) => {
              setNewCaptions((current) => {
                const next: Record<string, string> = {};
                files.forEach((file) => {
                  const key = fileKey(file);
                  next[key] = current[key] ?? "";
                });
                return next;
              });
              setNewFiles(files);
            }}
            label="Add recommendation photos or videos"
            description="Uploads must be 10MB total or smaller. Blank captions get a simple fallback caption."
          />
          {newFiles.length ? (
            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium">New upload captions</legend>
              {newFiles.map((file, index) => {
                const key = fileKey(file);
                return (
                  <label key={key} className="grid gap-1.5 text-sm font-medium">
                    Caption for new upload {index + 1}
                    <Input
                      value={newCaptions[key] ?? ""}
                      onChange={(event) => setNewCaptions((current) => ({ ...current, [key]: event.target.value }))}
                      placeholder="e.g. Finished prototype detail"
                    />
                  </label>
                );
              })}
            </fieldset>
          ) : null}
        </section>

        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save recommendation"}
        </Button>
      </form>
    </details>
  );
}

function RatingField({ name, label, value, error }: { name: string; label: string; value?: number; error?: string }) {
  return (
    <Field label={label} error={error}>
      <select name={name} defaultValue={value ?? 5} className="min-h-11 border border-[#ded8cc] bg-white px-3">
        {[5, 4, 3, 2, 1].map((rating) => (
          <option key={rating} value={rating}>{rating}/5</option>
        ))}
      </select>
    </Field>
  );
}

function ExistingMediaPreview({ media }: { media: NonNullable<AdminBusinessRecommendation["mediaItems"]>[number] }) {
  if (media.mimeType.startsWith("video/")) {
    return <video src={media.url} controls muted className="aspect-video w-full bg-black object-cover" />;
  }

  if (media.mimeType.startsWith("image/") || media.url) {
    return (
      <div className="overflow-hidden bg-[#f3eee5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.url} alt="" className="aspect-video w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-[#f3eee5] text-[#6d675d]">
      {media.mimeType.startsWith("video/") ? <Video className="h-8 w-8" aria-hidden /> : <ImageIcon className="h-8 w-8" aria-hidden />}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-[#8a3c24]">{error}</span> : null}
    </label>
  );
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
