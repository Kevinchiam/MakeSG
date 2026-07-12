import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ asChild, className, variant = "primary", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2",
        variant === "primary" && "border-[#211f1b] bg-[#211f1b] text-white hover:bg-[#3a352e]",
        variant === "secondary" && "border-[#ded8cc] bg-white text-[#211f1b] hover:bg-[#f3eee5]",
        variant === "ghost" && "border-transparent bg-transparent text-[#211f1b] hover:bg-[#f3eee5]",
        variant === "danger" && "border-[#9c4f35] bg-[#9c4f35] text-white hover:bg-[#843f2a]",
        className,
      )}
      {...props}
    />
  );
}
