"use client";

import Link from "next/link";
import { Copy, ExternalLink, KeyRound } from "lucide-react";
import { useRef, useState } from "react";
import { ensureBusinessPrivateLink, ensureCreativeJobPrivateLink } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

type PrivateLinkKind = "business" | "creative-job";

type AdminPrivateLinkControlProps = {
  id: string;
  initialManageToken?: string | null;
  kind: PrivateLinkKind;
  compact?: boolean;
};

export function AdminPrivateLinkControl({ id, initialManageToken, kind, compact = false }: AdminPrivateLinkControlProps) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [manageToken, setManageToken] = useState(initialManageToken ?? null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useFeedbackFocus(messageRef, message);

  const path = manageToken ? privateLinkPath(kind, manageToken) : null;

  async function copyPrivateLink() {
    setMessage(null);
    setIsBusy(true);
    const token = manageToken ?? await createPrivateLink();
    setIsBusy(false);

    if (!token) return;

    const url = `${window.location.origin}${privateLinkPath(kind, token)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Private link copied.");
    } catch {
      setMessage(url);
    }
  }

  async function createPrivateLink() {
    const result = kind === "business" ? await ensureBusinessPrivateLink(id) : await ensureCreativeJobPrivateLink(id);
    if (!result.ok) {
      setMessage(result.message);
      return null;
    }

    setManageToken(result.manageToken);
    return result.manageToken;
  }

  return (
    <div className={compact ? "grid gap-2" : "border border-[#ded8cc] bg-white p-5"}>
      {!compact ? (
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#ded8cc] bg-[#fbfaf7] text-[#315c6b]">
            <KeyRound className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Private manage link</h2>
            <p className="mt-1 text-sm leading-6 text-[#6d675d]">Use this to help the owner edit their listing without an account. Anyone with the link can make changes.</p>
          </div>
        </div>
      ) : null}

      <div className={`flex flex-wrap gap-2 ${compact ? "justify-start" : ""}`}>
        <Button type="button" variant="secondary" disabled={isBusy} onClick={copyPrivateLink} className={compact ? "min-h-9 px-3" : undefined}>
          <Copy className="h-4 w-4" aria-hidden />
          {isBusy ? "Preparing..." : manageToken ? "Copy private link" : "Create private link"}
        </Button>
        {path ? (
          <Button asChild type="button" variant="ghost" className={compact ? "min-h-9 px-3" : undefined}>
            <Link href={path} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open
            </Link>
          </Button>
        ) : null}
      </div>

      {message ? (
        <p ref={messageRef} tabIndex={-1} role="status" className={`break-words text-sm text-[#536343] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${compact ? "max-w-xl" : "mt-3"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

function privateLinkPath(kind: PrivateLinkKind, token: string) {
  return kind === "business" ? `/businesses/manage/${token}` : `/creative-jobs/manage/${token}`;
}
