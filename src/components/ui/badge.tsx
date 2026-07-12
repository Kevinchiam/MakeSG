import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-[#ded8cc] bg-[#f3eee5] px-2.5 py-1 text-xs font-medium text-[#4f493f]",
        className,
      )}
      {...props}
    />
  );
}
