"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
  return <section className="container-shell py-20 text-center"><h1 className="font-serif text-5xl font-semibold">Something went wrong</h1><p className="mt-4 text-[#6d675d]">The request could not be completed. Try again in a moment.</p><Button className="mt-6" onClick={reset}>Try again</Button></section>;
}
