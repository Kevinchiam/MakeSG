"use client";

import { Check, X } from "lucide-react";
import { useRef, useState } from "react";
import { updateBusinessChangeRequestStatus } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessChangeRequestStatus } from "@/lib/business-change-requests";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

export function BusinessChangeRequestControls({
  requestId,
  initialStatus,
  initialNotes = "",
}: {
  requestId: string;
  initialStatus: BusinessChangeRequestStatus;
  initialNotes?: string;
}) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useFeedbackFocus(messageRef, message);

  async function updateStatus(nextStatus: "reviewed" | "dismissed") {
    setMessage(null);
    setIsSaving(true);
    const result = await updateBusinessChangeRequestStatus(requestId, nextStatus, notes);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message ?? "Could not update this request.");
      return;
    }

    setStatus(nextStatus);
    setMessage(nextStatus === "reviewed" ? "Marked reviewed." : "Dismissed. It has been moved to the trash bin for seven days.");
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-medium">
        Admin notes
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional note, for example: updated listing manually or no change needed."
          rows={3}
        />
      </label>
      {message ? <p ref={messageRef} tabIndex={-1} className="text-sm font-medium text-[#536343] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b]" role="status">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={isSaving || status === "reviewed"} onClick={() => updateStatus("reviewed")}>
          <Check className="h-4 w-4" aria-hidden /> {status === "reviewed" ? "Reviewed" : "Mark reviewed"}
        </Button>
        <Button type="button" variant="danger" disabled={isSaving || status === "dismissed"} onClick={() => updateStatus("dismissed")}>
          <X className="h-4 w-4" aria-hidden /> {status === "dismissed" ? "Dismissed" : "Dismiss"}
        </Button>
      </div>
    </div>
  );
}
