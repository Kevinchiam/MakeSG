import type { ModerationDecision, ModerationRisk } from "@/lib/types";

type ModerationSummaryProps = {
  decision?: ModerationDecision | null;
  risk?: ModerationRisk | null;
  reason?: string | null;
  signals?: string[];
  compact?: boolean;
};

const riskStyles: Record<ModerationRisk, string> = {
  low: "border-[#b9c9aa] bg-[#f2f6ed] text-[#3f5136]",
  medium: "border-[#d8c28e] bg-[#fff9e8] text-[#705421]",
  high: "border-[#d8a28f] bg-[#fff3ee] text-[#8c3c24]",
};

export function ModerationSummary({ decision, risk, reason, signals = [], compact = false }: ModerationSummaryProps) {
  if (!decision && !risk && !reason && signals.length === 0) {
    return null;
  }

  const resolvedRisk = risk ?? "medium";
  const label = decision ? decision.replace("_", " ") : "needs review";

  return (
    <section className={`border ${riskStyles[resolvedRisk]} ${compact ? "p-3" : "p-4"}`} aria-label="Automated moderation triage">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide">Automated triage</p>
        <span className="border border-current px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">{resolvedRisk} risk</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {reason ? <p className="mt-2 text-sm leading-6">{reason}</p> : null}
      {signals.length ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {signals.map((signal) => (
            <li key={signal} className="border border-current px-2 py-0.5 text-xs">
              {signal}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
