import type { Metadata } from "next";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import { BusinessListingForm } from "@/features/businesses/business-listing-form";

export const metadata: Metadata = { title: "For businesses" };

export default function ForBusinessesPage() {
  return (
    <section className="container-shell py-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Provider onboarding</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">List a creative service or fabrication business</h1>
          <p className="mt-5 text-lg leading-8 text-[#6d675d]">Create a listing with services, materials, contact details, budget range, lead time and portfolio notes. Providers submit for approval before publication.</p>
          <div className="mt-8 grid gap-4">
            <Step icon={<Building2 />} title="Describe your capabilities" />
            <Step icon={<Clock />} title="Set indicative budget and lead time" />
            <Step icon={<CheckCircle2 />} title="Submit for moderation" />
          </div>
        </div>
        <BusinessListingForm />
      </div>
    </section>
  );
}

function Step({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-3 border border-[#ded8cc] bg-white p-4 text-sm font-semibold">{icon}{title}</div>;
}
