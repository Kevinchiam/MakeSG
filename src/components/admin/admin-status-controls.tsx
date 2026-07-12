"use client";

import { Check, EyeOff, Star, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminStatusControls({ initialStatus = "pending" }: { initialStatus?: string }) {
  const [status, setStatus] = useState(initialStatus);
  return (
    <div className="grid gap-3 border border-[#ded8cc] bg-white p-4">
      <p className="text-sm font-semibold">Current status: {status}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setStatus("published")}>
          <Check className="h-4 w-4" /> Approve
        </Button>
        <Button type="button" variant="danger" onClick={() => setStatus("rejected")}>
          <X className="h-4 w-4" /> Reject
        </Button>
        <Button type="button" variant="secondary" onClick={() => setStatus("featured")}>
          <Star className="h-4 w-4" /> Feature
        </Button>
        <Button type="button" variant="secondary" onClick={() => setStatus("suspended")}>
          <EyeOff className="h-4 w-4" /> Unpublish
        </Button>
      </div>
    </div>
  );
}
