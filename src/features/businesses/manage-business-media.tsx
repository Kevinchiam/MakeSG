"use client";

import { ImageIcon, Save, Trash2, Video } from "lucide-react";
import { useRef, useState } from "react";
import { FileUploader } from "@/components/projects/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBusinessMediaByToken } from "@/features/businesses/actions";
import type { PortfolioItem } from "@/lib/types";

export function ManageBusinessMedia({ token, portfolio }: { token: string; portfolio: PortfolioItem[] }) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newCaptions, setNewCaptions] = useState<Record<string, string>>({});
  const [captionUpdates, setCaptionUpdates] = useState<Record<string, string>>(
    Object.fromEntries(portfolio.map((item) => [item.id, item.title])),
  );
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const visibleItems = portfolio.filter((item) => !deletedIds.includes(item.id));

  async function updateMedia(formData: FormData) {
    setIsSaving(true);
    setMessage(null);

    deletedIds.forEach((id) => formData.append("deletedPortfolioIds", id));
    Object.entries(captionUpdates).forEach(([id, caption]) => formData.append("portfolioCaptionUpdates", `${id}::${caption}`));
    newFiles.forEach((file) => {
      formData.append("newPortfolioFiles", file);
      formData.append("newPortfolioCaptions", newCaptions[fileKey(file)] ?? "");
    });

    const result = await updateBusinessMediaByToken(token, formData);
    setIsSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      window.setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }

    setNewFiles([]);
    setNewCaptions({});
    setMessage({ tone: "success", text: "Portfolio updated. Your listing is waiting for review again." });
    window.setTimeout(() => messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  return (
    <form action={updateMedia} className="mt-8 grid gap-5 border border-[#ded8cc] bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Portfolio media</p>
        <h2 className="mt-1 text-2xl font-semibold">Edit photos and videos</h2>
        <p className="mt-2 text-sm leading-6 text-[#6d675d]">Changes to portfolio media are reviewed before they appear publicly.</p>
      </div>
      {message ? (
        <p ref={messageRef} className={`border p-3 text-sm ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`} role={message.tone === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
      {visibleItems.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleItems.map((item) => (
            <article key={item.id} className="border border-[#ded8cc] bg-white p-3">
              <ExistingMediaPreview item={item} />
              <label className="mt-3 grid gap-1.5 text-sm font-medium">
                Caption
                <Input
                  value={captionUpdates[item.id] ?? ""}
                  onChange={(event) => setCaptionUpdates((current) => ({ ...current, [item.id]: event.target.value }))}
                  placeholder="Describe this photo or video"
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                className="mt-3"
                onClick={() => setDeletedIds((current) => [...current, item.id])}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-[#ded8cc] p-4 text-sm text-[#6d675d]">No portfolio media will remain unless you add new uploads below.</p>
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
        label="Add portfolio photos or videos"
        description="Photos and videos are stored safely and shown after approval. Uploads must be 10MB total or smaller. Leave captions blank and MakeSG will add a simple one."
      />
      {newFiles.length ? (
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">New upload captions</legend>
          <p className="text-xs leading-5 text-[#6d675d]">Add a caption if you have one. If you leave it blank, MakeSG will add a simple caption after upload.</p>
          {newFiles.map((file, index) => {
            const key = fileKey(file);
            return (
              <label key={key} className="grid gap-1.5 text-sm font-medium">
                Caption for new upload {index + 1}
                <Input
                  value={newCaptions[key] ?? ""}
                  onChange={(event) => setNewCaptions((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder="e.g. Product photography for ceramic vessel"
                />
              </label>
            );
          })}
        </fieldset>
      ) : null}
      <Button type="submit" disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save portfolio media"}
      </Button>
    </form>
  );
}

function ExistingMediaPreview({ item }: { item: PortfolioItem }) {
  const mimeType = item.mimeType ?? item.tags[0] ?? "";

  if (mimeType.startsWith("video/")) {
    return <video src={item.imageUrl} controls muted className="aspect-video w-full bg-black object-cover" />;
  }

  if (mimeType.startsWith("image/") || item.imageUrl) {
    return (
      <div className="overflow-hidden bg-[#f3eee5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt="" className="aspect-video w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-[#f3eee5] text-[#6d675d]">
      {mimeType.startsWith("video/") ? <Video className="h-8 w-8" aria-hidden /> : <ImageIcon className="h-8 w-8" aria-hidden />}
    </div>
  );
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
