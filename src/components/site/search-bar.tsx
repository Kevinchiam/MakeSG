"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ placeholder = "What are you trying to make?", action = "/businesses" }) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const q = String(form.get("q") ?? "").trim();
    router.push(q ? `${action}?q=${encodeURIComponent(q)}` : action);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 border border-[#211f1b] bg-white p-2 shadow-sm sm:flex-row">
      <label className="sr-only" htmlFor="site-search">
        Search providers
      </label>
      <Input id="site-search" name="q" placeholder={placeholder} className="border-0 shadow-none" />
      <Button type="submit" className="shrink-0">
        <Search className="h-4 w-4" aria-hidden />
        Find providers
      </Button>
    </form>
  );
}
