"use client";

import { FileText, FileUp, ImageIcon, Video, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
const pdfTypes = ["application/pdf"];

type FileUploaderProps = {
  label?: string;
  description?: string;
  accept?: "references" | "media";
  maxSizeMb?: number;
  maxTotalSizeMb?: number;
  error?: string | null;
  value?: File[];
  onFilesChange?: (files: File[]) => void;
};

export function FileUploader({
  label = "Upload reference files",
  description,
  accept = "references",
  maxSizeMb = accept === "media" ? 40 : 8,
  maxTotalSizeMb,
  error: externalError,
  value,
  onFilesChange,
}: FileUploaderProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const files = value ?? internalFiles;
  const allowed = accept === "media" ? [...imageTypes, ...videoTypes] : [...imageTypes, ...pdfTypes];
  const acceptAttribute =
    accept === "media" ? ".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm" : ".jpg,.jpeg,.png,.webp,.pdf";
  const helperText =
    description ??
    (accept === "media"
      ? `JPG, PNG, WebP, MP4, MOV or WebM${maxTotalSizeMb ? ` up to ${maxTotalSizeMb}MB total` : ` up to ${maxSizeMb}MB each`}`
      : `JPG, PNG, WebP or PDF up to ${maxSizeMb}MB each`);

  async function onFiles(nextFiles: FileList | null) {
    setError(null);
    if (!nextFiles) return;
    const valid: File[] = [];
    for (const file of Array.from(nextFiles)) {
      if (!allowed.includes(file.type)) {
        setError(accept === "media" ? "Upload JPG, PNG, WebP, MP4, MOV or WebM files only." : "Upload JPG, PNG, WebP or PDF files only.");
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Each file must be ${maxSizeMb}MB or smaller.`);
        continue;
      }
      valid.push(accept === "media" && imageTypes.includes(file.type) ? await optimizeImage(file) : file);
    }
    const next = [...files, ...valid];
    if (maxTotalSizeMb && totalSizeMb(next) > maxTotalSizeMb) {
      setError(`Uploads must be ${maxTotalSizeMb}MB total or smaller. Remove a file or upload smaller files.`);
      return;
    }
    setFiles(next);
  }

  function setFiles(nextFiles: File[]) {
    if (onFilesChange) {
      onFilesChange(nextFiles);
      return;
    }
    setInternalFiles(nextFiles);
  }

  return (
    <div className="grid gap-3">
      <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#bdb3a4] bg-white p-8 text-center">
        <FileUp className="mb-3 h-8 w-8 text-[#315c6b]" aria-hidden />
        <span className="font-medium">{label}</span>
        <span className="mt-1 text-sm text-[#6d675d]">{helperText}</span>
        {accept === "media" ? <span className="mt-1 text-xs text-[#6d675d]">Large images are optimized before upload.</span> : null}
        <input className="sr-only" type="file" accept={acceptAttribute} multiple onChange={(event) => void onFiles(event.target.files)} />
      </label>
      {error || externalError ? <p className="text-sm text-[#9c4f35]" role="alert">{error ?? externalError}</p> : null}
      {files.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className="border border-[#ded8cc] bg-white p-3 text-sm">
              <MediaPreview file={file} />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">{file.name}</span>
                <Button type="button" variant="ghost" onClick={() => setFiles(files.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

async function optimizeImage(file: File) {
  if (file.size < 900 * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function totalSizeMb(files: File[]) {
  return files.reduce((total, file) => total + file.size, 0) / 1024 / 1024;
}

function MediaPreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  if (imageTypes.includes(file.type)) {
    return (
      <div className="overflow-hidden bg-[#f3eee5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="aspect-video w-full object-cover" />
      </div>
    );
  }

  if (videoTypes.includes(file.type)) {
    return <video src={url} controls muted className="aspect-video w-full bg-black object-cover" />;
  }

  return (
    <div className="flex aspect-video items-center justify-center bg-[#f3eee5] text-[#6d675d]">
      {file.type === "application/pdf" ? <FileText className="h-8 w-8" aria-hidden /> : file.type.startsWith("image/") ? <ImageIcon className="h-8 w-8" aria-hidden /> : <Video className="h-8 w-8" aria-hidden />}
    </div>
  );
}
