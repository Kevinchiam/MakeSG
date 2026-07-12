import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  ["Explore", "/explore"],
  ["Services", "/services"],
  ["Businesses", "/businesses"],
  ["Recommend", "/recommend-business"],
  ["For businesses", "/for-businesses"],
  ["About", "/about"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#ded8cc] bg-[#fbfaf7]/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-normal">
          MakeSG
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#4f493f] md:flex" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#211f1b]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/businesses">
              <Search className="h-4 w-4" aria-hidden />
              Search
            </Link>
          </Button>
          <Button asChild variant="secondary" className="hidden md:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/projects/new">Start a brief</Link>
          </Button>
          <Button variant="ghost" className="md:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
