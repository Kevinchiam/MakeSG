import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full border border-[#ded8cc] bg-white px-3 py-2 text-sm text-[#211f1b] shadow-sm placeholder:text-[#8a8276] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#315c6b]",
        className,
      )}
      {...props}
    />
  );
}
