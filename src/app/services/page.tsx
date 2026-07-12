import type { Metadata } from "next";
import { ServiceCard } from "@/components/business/service-card";
import { services } from "@/lib/data";

export const metadata: Metadata = { title: "Services", description: "Browse creative services and fabrication categories." };

export default function ServicesPage() {
  return (
    <section className="container-shell py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Service categories</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">What do you need made?</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => <ServiceCard key={service.slug} service={service} />)}
      </div>
    </section>
  );
}
