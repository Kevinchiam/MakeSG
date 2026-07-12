import { notFound } from "next/navigation";
import { BusinessGrid } from "@/components/business/business-grid";
import { businesses, services } from "@/lib/data";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const providers = businesses.filter((business) => business.services.includes(service.slug));
  return (
    <section className="container-shell py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">{service.group}</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">{service.name}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6d675d]">{service.description}</p>
      <div className="mt-10">
        <BusinessGrid businesses={providers} />
      </div>
    </section>
  );
}
