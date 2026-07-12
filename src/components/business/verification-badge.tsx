import { CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/types";

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const verified = status === "verified";
  return (
    <Badge className={verified ? "border-[#536343] bg-[#eef2e8] text-[#39462d]" : ""}>
      {verified ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <CircleDashed className="h-3.5 w-3.5" aria-hidden />}
      <span className="ml-1">{verified ? "Verified" : status === "claimed" ? "Claimed" : "Unverified"}</span>
    </Badge>
  );
}
