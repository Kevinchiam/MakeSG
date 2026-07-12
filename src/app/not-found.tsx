import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <section className="container-shell py-20 text-center"><h1 className="font-serif text-5xl font-semibold">Page not found</h1><p className="mt-4 text-[#6d675d]">This page may have moved or the listing is unavailable.</p><Button asChild className="mt-6"><Link href="/businesses">Browse providers</Link></Button></section>;
}
