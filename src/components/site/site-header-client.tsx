"use client";

import Link from "next/link";
import { LayoutDashboard, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  ["Explore", "/explore"],
  ["Services", "/services"],
  ["Businesses", "/businesses"],
  ["Recommend", "/recommend-business"],
  ["For businesses", "/for-businesses"],
  ["About", "/about"],
];

export function SiteHeaderClient({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#ded8cc] bg-[#fbfaf7]/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-normal">
          MakeSG
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#4f493f] lg:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#211f1b]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button asChild variant="secondary" className="hidden h-10 w-10 px-0 lg:inline-flex" title="Admin home">
              <Link href="/admin" aria-label="Admin home">
                <LayoutDashboard className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost" className="hidden lg:inline-flex">
            <Link href="/businesses">
              <Search className="h-4 w-4" aria-hidden />
              Search
            </Link>
          </Button>
          <Button asChild variant="secondary" className="hidden lg:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/projects/new">Start a brief</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-[#ded8cc] bg-[#fbfaf7] lg:hidden" aria-label="Mobile navigation">
          <div className="container-shell grid gap-1 py-3 text-sm font-medium">
            {isAdmin ? (
              <Link href="/admin" className="border-b border-[#eee7dc] py-3 font-semibold" onClick={() => setOpen(false)}>
                Admin home
              </Link>
            ) : null}
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="border-b border-[#eee7dc] py-3 last:border-b-0" onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/businesses" className="border-b border-[#eee7dc] py-3" onClick={() => setOpen(false)}>
              Search
            </Link>
            <Link href="/sign-in" className="py-3" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
