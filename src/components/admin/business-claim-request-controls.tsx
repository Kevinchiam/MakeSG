"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { updateBusinessClaimRequestStatus } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

export function BusinessClaimRequestControls({
  requestId,
  status,
}: {
  requestId: string;
  status: "pending" | "approved" | "rejected";
}) {
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  useFeedbackFocus(feedbackRef, message);

  async function save(nextStatus: "approved" | "rejected") {
    setIsSaving(true);
    setMessage(null);
    const result = await updateBusinessClaimRequestStatus(requestId, nextStatus, notes);
    setIsSaving(false);

    if (!result.ok) {
      setMessage({ tone: "error", text: result.message });
      return;
    }

    setMessage({
      tone: "success",
      text: nextStatus === "approved" ? "Claim approved. The business is now marked as owner claimed." : "Claim rejected.",
    });
  }

  return (
    <div className="grid gap-3">
      {message ? (
        <p
          ref={feedbackRef}
          tabIndex={-1}
          className={`border p-3 text-sm leading-6 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${message.tone === "success" ? "border-[#b9c6ae] bg-[#eef2e8] text-[#39462d]" : "border-[#e2b8a7] bg-[#fff6f1] text-[#8a3c24]"}`}
          role={message.tone === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}
      {status === "pending" ? (
        <>
          <label className="grid gap-1.5 text-sm font-medium">
            Admin notes (optional)
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record how you checked the claim." />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => save("approved")} disabled={isSaving}>
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Approve claim
            </Button>
            <Button type="button" variant="secondary" onClick={() => save("rejected")} disabled={isSaving}>
              <XCircle className="h-4 w-4" aria-hidden /> Reject
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm leading-6 text-[#6d675d]">This claim has already been {status}.</p>
      )}
    </div>
  );
}
