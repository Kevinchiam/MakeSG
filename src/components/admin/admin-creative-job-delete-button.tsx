"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { deleteCreativeJobEntry } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

export function AdminCreativeJobDeleteButton({ jobId }: { jobId: string }) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  useFeedbackFocus(messageRef, message);

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
      {message ? <p ref={messageRef} tabIndex={-1} className="text-sm text-[#9c4f35] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b]" role="alert">{message}</p> : null}
    </div>
  );
}
