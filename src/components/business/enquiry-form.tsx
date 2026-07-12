"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function EnquiryForm({ businessId }: { businessId: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border border-[#536343] bg-[#eef2e8] p-4 text-sm text-[#39462d]" role="status">
        Enquiry saved locally for this MVP. In Supabase mode this will create an enquiry and send notifications.
      </div>
    );
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <input type="hidden" name="businessId" value={businessId} />
      <label className="grid gap-1 text-sm font-medium">
        Message
        <Textarea name="message" required minLength={20} placeholder="Share the project, timing, budget range and any known materials." />
      </label>
      <Button type="submit">
        <Send className="h-4 w-4" /> Send enquiry
      </Button>
    </form>
  );
}
