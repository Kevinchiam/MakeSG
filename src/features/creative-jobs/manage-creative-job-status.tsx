"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateCreativeJobStatusByToken } from "@/features/creative-jobs/actions";
import { creativeJobStatusLabel, type CreativeJobStatus } from "@/lib/creative-jobs";

const statuses: Array<{ value: CreativeJobStatus; label: string; description: string }> = [
  { value: "open", label: "Open", description: "Businesses can contact you." },
  { value: "in_discussion", label: "In discussion", description: "You are speaking with businesses, but it is not confirmed yet." },
  { value: "taken", label: "Taken", description: "You have selected a business and no longer need responses." },
];

export function ManageCreativeJobStatus({ token, initialStatus }: { token: string; initialStatus: CreativeJobStatus }) {
  const [status, setStatus] = useState<CreativeJobStatus>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(nextStatus: CreativeJobStatus) {
    setIsSaving(true);
    setMessage(null);
    const result = await updateCreativeJobStatusByToken(token, nextStatus);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setStatus(result.status);
    setMessage(`Status updated to ${creativeJobStatusLabel(result.status)}.`);
  }

  return (
    <div className="grid gap-4 border border-[#ded8cc] bg-white p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Current status</p>
        <p className="mt-1 text-2xl font-semibold">{creativeJobStatusLabel(status)}</p>
      </div>
      {message ? <p className="border border-[#b9c6ae] bg-[#eef2e8] p-3 text-sm text-[#39462d]" role="status">{message}</p> : null}
      <div className="grid gap-3">
        {statuses.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={isSaving}
            onClick={() => updateStatus(item.value)}
            className={`grid gap-1 border px-4 py-3 text-left disabled:opacity-50 ${status === item.value ? "border-[#211f1b] bg-[#211f1b] text-white" : "border-[#ded8cc] bg-white text-[#211f1b]"}`}
          >
            <span className="font-semibold">{item.label}</span>
            <span className={status === item.value ? "text-sm text-[#f4efe6]" : "text-sm text-[#6d675d]"}>{item.description}</span>
          </button>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={() => window.location.href = "/creative-jobs"}>
        View creative jobs
      </Button>
    </div>
  );
}
