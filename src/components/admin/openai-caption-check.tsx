"use client";

import { Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { testOpenAiCaptionConnection } from "@/components/admin/actions";
import { Button } from "@/components/ui/button";
import { useFeedbackFocus } from "@/lib/use-feedback-focus";

type CheckResult = Awaited<ReturnType<typeof testOpenAiCaptionConnection>>;

export function OpenAiCaptionCheck() {
  const messageRef = useRef<HTMLDivElement>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  useFeedbackFocus(messageRef, result);

  async function runCheck() {
    setResult(null);
    setIsChecking(true);
    const nextResult = await testOpenAiCaptionConnection();
    setResult(nextResult);
    setIsChecking(false);
  }

  return (
    <section className="border border-[#ded8cc] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#ded8cc] bg-[#fbfaf7] text-[#315c6b]">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-xl font-semibold">AI caption check</h3>
            <p className="mt-2 text-sm leading-6 text-[#6d675d]">
              Test whether blank image captions can reach OpenAI from the live site. Your key is never shown.
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" disabled={isChecking} onClick={runCheck} className="shrink-0">
          {isChecking ? "Checking..." : "Test AI captions"}
        </Button>
      </div>

      {result ? (
        <div
          ref={messageRef}
          tabIndex={-1}
          role="status"
          className={`mt-4 border p-4 text-sm leading-6 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#315c6b] ${
            result.ok ? "border-[#b9c9aa] bg-[#f2f6ed] text-[#3f5136]" : "border-[#d9a391] bg-[#fff6f1] text-[#8a3f2b]"
          }`}
        >
          <p className="font-semibold">{result.message}</p>
          <p className="mt-1">Key available: {result.keyAvailable ? "Yes" : "No"}</p>
          <p>Model: {result.model}</p>
          {result.ok ? <p>Sample response: {result.sample}</p> : null}
          {!result.ok && result.detail ? <p className="mt-2 break-words">{result.detail}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
