import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block border border-[#ded8cc] bg-white p-5 hover:border-[#315c6b]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9c4f35]">{service.group}</p>
      <h2 className="mt-3 flex items-center justify-between gap-4 text-xl font-semibold">
        {service.name}
        <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#6d675d]">{service.description}</p>
    </Link>
  );
}
