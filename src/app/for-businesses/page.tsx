import type { Metadata } from "next";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import { BusinessListingForm } from "@/features/businesses/business-listing-form";
import { getExistingBusinessSuggestions } from "@/lib/business-submissions";

export const metadata: Metadata = { title: "For businesses" };

export const dynamic = "force-dynamic";

export default async function ForBusinessesPage() {
  const existingBusinesses = await getExistingBusinessSuggestions();

  return (
    <section className="container-shell py-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Share a business</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Help people discover a good creative business</h1>
          <p className="mt-5 text-lg leading-8 text-[#6d675d]">
            Add a business you run, have worked with, or think the MakeSG community should know about. Share what you know now; the optional details can be updated later with a private edit link.
          </p>
          <div className="mt-8 grid gap-4">
            <Step icon={<Building2 />} title="Describe what the business does" />
            <Step icon={<Clock />} title="Add contact, budget and timing details if you know them" />
            <Step icon={<CheckCircle2 />} title="Send it for review" />
          </div>
        </div>
        <BusinessListingForm existingBusinesses={existingBusinesses} />
      </div>
    </section>
  );
}

function Step({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-3 border border-[#ded8cc] bg-white p-4 text-sm font-semibold">{icon}{title}</div>;
}
