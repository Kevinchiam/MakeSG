"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCreativeJobMediaByToken } from "@/features/creative-jobs/actions";
import type { CreativeJobReference } from "@/lib/creative-jobs";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

export function ManageCreativeJobMedia({ token, references }: { token: string; references: CreativeJobReference[] }) {
  const router = useRouter();
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [existingReferences, setExistingReferences] = useState(references);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>(
    Object.fromEntries(references.map((reference) => [reference.id, reference.caption ?? ""])),
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newCaptions, setNewCaptions] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useFeedbackFocus(messageRef, message);

  async function updateMedia() {
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    deletedIds.forEach((id) => formData.append("deletedReferenceIds", id));
    existingReferences.forEach((reference) => {
      formData.append("referenceCaptionUpdates", `${reference.id}::${captions[reference.id] ?? ""}`);
    });
    newFiles.forEach((file) => {
      formData.append("newReferenceFiles", file);
      formData.append("newReferenceCaptions", newCaptions[fileKey(file)] ?? "");
    });

    const result = await updateCreativeJobMediaByToken(token, formData);
    setIsSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      return;
    }

    setNewFiles([]);
    setNewCaptions({});
    setDeletedIds([]);
    setMessage({ tone: "success", text: "Photos and videos updated." });
    router.refresh();
  }

  function removeExisting(reference: CreativeJobReference) {
    setExistingReferences((current) => current.filter((item) => item.id !== reference.id));
    setDeletedIds((current) => [...current, reference.id]);
  }

  return (
    <section className="mt-8 grid gap-5 border border-[#ded8cc] bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Photos and videos</p>
        <h2 className="mt-1 text-2xl font-semibold">Edit reference media</h2>
        <p className="mt-2 text-sm leading-6 text-[#6d675d]">Add, remove or caption the photos and videos shown with this creative job.</p>
      </div>
      {message ? (
        <p ref={messageRef} tabIndex={-1} className={`border p-3 text-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`} role={message.tone === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
      {existingReferences.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {existingReferences.map((reference) => (
            <article key={reference.id} className="border border-[#ded8cc] bg-[#fbfaf7] p-3">
              {reference.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reference.fileUrl} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <video src={reference.fileUrl} controls muted className="aspect-video w-full bg-black object-cover" />
              )}
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium">{reference.fileName}</span>
                <Button type="button" variant="ghost" onClick={() => removeExisting(reference)} aria-label={`Remove ${reference.fileName}`}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <label className="mt-3 grid gap-1.5 text-sm font-medium">
                Caption
                <Input
                  value={captions[reference.id] ?? ""}
                  onChange={(event) => setCaptions((current) => ({ ...current, [reference.id]: event.target.value }))}
                  placeholder="Optional caption"
                />
              </label>
            </article>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-[#ded8cc] bg-[#fbfaf7] p-4 text-sm text-[#6d675d]">No current photos or videos.</p>
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
        label="Add photos or videos"
        description="Upload additional JPG, PNG, WebP, MP4, MOV or WebM files. All media for this job must be 10MB total or smaller."
      />
      {newFiles.length ? (
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Captions for new uploads</legend>
          {newFiles.map((file, index) => {
            const key = fileKey(file);
            return (
              <label key={key} className="grid gap-1.5 text-sm font-medium">
                Caption for new upload {index + 1}
                <Input
                  value={newCaptions[key] ?? ""}
                  onChange={(event) => setNewCaptions((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder="Optional caption"
                />
              </label>
            );
          })}
        </fieldset>
      ) : null}
      <Button type="button" disabled={isSaving} onClick={() => void updateMedia()}>
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save photos and videos"}
      </Button>
    </section>
  );
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
