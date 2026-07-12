"use client";

import { FileUp, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const maxSize = 8 * 1024 * 1024;

export function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function onFiles(nextFiles: FileList | null) {
    setError(null);
    if (!nextFiles) return;
    const valid: File[] = [];
    for (const file of Array.from(nextFiles)) {
      if (!allowed.includes(file.type)) {
        setError("Upload JPG, PNG, WebP or PDF files only.");
        continue;
      }
      if (file.size > maxSize) {
        setError("Each file must be 8MB or smaller.");
        continue;
      }
      valid.push(file);
    }
    setFiles((current) => [...current, ...valid]);
  }

  return (
    <div className="grid gap-3">
      <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#bdb3a4] bg-white p-8 text-center">
        <FileUp className="mb-3 h-8 w-8 text-[#315c6b]" aria-hidden />
        <span className="font-medium">Upload reference files</span>
        <span className="mt-1 text-sm text-[#6d675d]">JPG, PNG, WebP or PDF up to 8MB each</span>
        <input className="sr-only" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" multiple onChange={(event) => onFiles(event.target.files)} />
      </label>
      {error ? <p className="text-sm text-[#9c4f35]" role="alert">{error}</p> : null}
      {files.length ? (
        <ul className="grid gap-2">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center justify-between border border-[#ded8cc] bg-white px-3 py-2 text-sm">
              <span>{file.name}</span>
              <Button type="button" variant="ghost" onClick={() => setFiles((current) => current.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
