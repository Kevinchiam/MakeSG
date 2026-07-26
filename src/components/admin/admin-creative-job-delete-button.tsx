"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCreativeJobEntry } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";

export function AdminCreativeJobDeleteButton({ jobId }: { jobId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteJob() {
    setMessage(null);
    const confirmed = window.confirm("Delete this creative job listing? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteCreativeJobEntry(jobId);
    setIsDeleting(false);

    if (!result.ok) {
      setMessage(result.message ?? "Could not delete this creative job.");
      return;
    }

    window.location.href = "/admin/creative-jobs";
  }

  return (
    <div className="grid gap-2">
      <Button type="button" variant="danger" disabled={isDeleting} onClick={deleteJob}>
        <Trash2 className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete creative job"}
      </Button>
      {message ? <p className="text-sm text-[#9c4f35]" role="alert">{message}</p> : null}
    </div>
  );
}
