"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { sendBusinessEnquiry } from "@/components/business/enquiry-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function EnquiryForm({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string; address?: string; recipientEmail?: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (status?.tone === "success") {
    return (
      <div className="border border-[#536343] bg-[#eef2e8] p-4 text-sm text-[#39462d]" role="status">
        {status.message}
      </div>
    );
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSending(true);
        setStatus(null);
        const result = await sendBusinessEnquiry(new FormData(event.currentTarget));
        setIsSending(false);

        if (!result.ok) {
          setStatus({ tone: "error", message: result.message, address: result.address, recipientEmail: result.recipientEmail });
          return;
        }

        setStatus({ tone: "success", message: result.message });
      }}
    >
      <input type="hidden" name="businessId" value={businessId} />
      {status?.tone === "error" ? (
        <div className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm leading-6 text-[#8a3c24]" role="alert">
          <p>{status.message}</p>
          {status.recipientEmail ? (
            <p className="mt-2 font-semibold">
              Email: <a className="underline" href={`mailto:${status.recipientEmail}`}>{status.recipientEmail}</a>
            </p>
          ) : null}
          {status.address ? <p className="mt-2 font-semibold">Location: {status.address}</p> : null}
        </div>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        Your name
        <Input name="senderName" required minLength={2} />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Your email
        <Input name="senderEmail" type="email" required />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Message
        <Textarea name="message" required minLength={20} placeholder="Share the project, timing, budget range and any known materials." />
      </label>
      <Button type="submit" disabled={isSending}>
        <Send className="h-4 w-4" /> {isSending ? "Sending..." : "Send enquiry"}
      </Button>
    </form>
  );
}
