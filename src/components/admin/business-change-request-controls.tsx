"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { updateBusinessChangeRequestStatus } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessChangeRequestStatus } from "@/lib/business-change-requests";

export function BusinessChangeRequestControls({
  requestId,
  initialStatus,
  initialNotes = "",
}: {
  requestId: string;
  initialStatus: BusinessChangeRequestStatus;
  initialNotes?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    setMessage(nextStatus === "reviewed" ? "Marked reviewed." : "Dismissed.");
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
      {message ? <p className="text-sm font-medium text-[#536343]" role="status">{message}</p> : null}
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
