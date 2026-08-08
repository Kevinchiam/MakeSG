"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateCreativeJobStatusByToken } from "@/features/creative-jobs/actions";
import { creativeJobStatusLabel, type CreativeJobStatus } from "@/lib/creative-jobs";

const statuses: Array<{ value: CreativeJobStatus; label: string }> = [
  { value: "open", label: "Open" },
  { value: "in_discussion", label: "In discussion" },
  { value: "taken", label: "Taken" },
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
    <div className="grid self-start border border-[#ded8cc] bg-white p-5 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Current status</p>
        <p className="mt-1 text-2xl font-semibold">{creativeJobStatusLabel(status)}</p>
      </div>
      {message ? <p className="mt-4 border border-[#b9c6ae] bg-[#eef2e8] p-3 text-sm text-[#39462d]" role="status">{message}</p> : null}
      <div className="mt-5 grid grid-cols-3 border border-[#ded8cc]">
        {statuses.map((item) => (
          <button
            key={item.value}
            type="button"
            disabled={isSaving}
            onClick={() => updateStatus(item.value)}
            className={`min-h-11 border-r border-[#ded8cc] px-2 py-2 text-center text-sm font-semibold last:border-r-0 disabled:opacity-50 ${status === item.value ? "bg-[#211f1b] text-white" : "bg-white text-[#211f1b]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <Button type="button" variant="secondary" className="mt-5" onClick={() => window.location.href = "/creative-jobs"}>
        View creative jobs
      </Button>
    </div>
  );
}
