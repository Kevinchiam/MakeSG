import type { Metadata } from "next";
import { RecommendBusinessEndorsement } from "@/components/business/recommend-business-endorsement";
import { getExistingBusinessSuggestions } from "@/lib/business-submissions";

export const metadata: Metadata = {
  title: "Endorse a business",
  description: "Endorse an existing Singapore creative-services or fabrication business you have worked with.",
};

export const dynamic = "force-dynamic";

export default async function RecommendBusinessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = Array.isArray(params.business) ? params.business[0] : params.business;
  const existingBusinesses = await getExistingBusinessSuggestions();
  const initialBusiness = existingBusinesses.find((item) => item.slug === slug);

  return (
    <section className="container-shell max-w-4xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Word of mouth</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Endorse a business you trust</h1>
      <p className="mt-4 max-w-2xl text-[#6d675d]">
        Help future makers spot reliable sources without creating duplicate listings. Search for the business, confirm it is the one you mean, then add an endorsement to its profile.
      </p>
      <div className="mt-10">
        <RecommendBusinessEndorsement businesses={existingBusinesses} initialQuery={initialBusiness?.name ?? ""} />
      </div>
    </section>
  );
}
