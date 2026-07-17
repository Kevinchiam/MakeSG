import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { services } from "@/lib/data";

export default function AdminServicesPage() {
  return <section className="container-shell py-12"><AdminPageHeader title="Service categories" /><div className="mt-8 grid gap-3">{services.map((service) => <div key={service.slug} className="border border-[#ded8cc] bg-white p-4"><h2 className="font-semibold">{service.name}</h2><p className="text-sm text-[#6d675d]">{service.description}</p></div>)}</div></section>;
}
