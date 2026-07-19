import type { Metadata } from "next";
import { CheckCircle2, ClipboardList, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreativeJobListingForm } from "@/features/creative-jobs/creative-job-listing-form";

export const metadata: Metadata = { title: "For creatives" };

export default function ForCreativesPage() {
  return (
    <section className="container-shell py-12">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Creative job board</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Post a job for MakeSG providers to review</h1>
          <p className="mt-5 text-lg leading-8 text-[#6d675d]">
            Create a focused job listing with scope, budget, timing, services needed and contact details. Providers can browse open jobs and reach out directly.
          </p>
          <div className="mt-8 grid gap-4">
            <Step icon={<ClipboardList />} title="Describe the work clearly" />
            <Step icon={<CheckCircle2 />} title="Set budget, timing and service needs" />
            <Step icon={<Mail />} title="Let providers contact you directly" />
          </div>
          <Button asChild variant="secondary" className="mt-6">
            <Link href="/creative-jobs">Browse posted creative jobs</Link>
          </Button>
        </div>
        <CreativeJobListingForm />
      </div>
    </section>
  );
}

function Step({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-3 border border-[#ded8cc] bg-white p-4 text-sm font-semibold">{icon}{title}</div>;
}
