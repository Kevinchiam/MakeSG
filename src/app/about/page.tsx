import type { Metadata } from "next";
import { BriefcaseBusiness, Camera, HeartHandshake, SearchCheck } from "lucide-react";
import { getPublishedBusinesses } from "@/lib/public-businesses";
import type { Business } from "@/lib/types";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const businesses = await getPublishedBusinesses();
  const media = getAboutMedia(businesses);

  return (
    <>
      <section className="about-hero editorial-grid border-b border-[#ded8cc]">
        <div className="container-shell grid gap-12 py-14 md:grid-cols-[0.95fr_1.05fr] md:items-center md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">About MakeSG</p>
            <h1 className="mt-3 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-normal md:text-7xl">
              A friendlier way to find people who can make things
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f594f]">
              MakeSG helps people in Singapore find creative businesses, production partners and specialist services without having to dig through old chats, saved posts or half-remembered names.
            </p>
          </div>
          <div className="about-visual-board border border-[#211f1b] bg-white p-4 shadow-[12px_12px_0_#d8d0c4]">
            <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
              <AboutMediaTile media={media[0]} className="min-h-[320px]" />
              <div className="grid gap-4">
                <AboutActionCard icon={<SearchCheck />} title="Search clearly" text="Look by service, location, budget or project need." />
                <AboutMediaTile media={media[1]} className="min-h-[150px]" />
                <AboutActionCard icon={<HeartHandshake />} title="Trust the trail" text="See community recommendations and useful listing details." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Why it exists</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold">Good work should be easier to find</h2>
          </div>
          <div className="grid gap-5 text-lg leading-8 text-[#4f493f]">
            <p>
              A lot of creative production in Singapore still moves through word of mouth. That is helpful when you already know the right people, but frustrating when you are starting a new project, exploring a new material or looking for a reliable business outside your usual circle.
            </p>
            <p>
              MakeSG gives those recommendations a shared home. You can browse businesses, look at photos and videos, post creative jobs, recommend someone good, or request a correction when a listing needs a small update.
            </p>
            <p>
              The goal is simple: help ideas move from wondering who can do this to knowing who to talk to, with less friction.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ded8cc] bg-white">
        <div className="container-shell grid gap-5 py-14 md:grid-cols-3">
          <AboutStep icon={<Camera />} title="See the work" text="Portfolio media makes each listing more tangible, so people can quickly understand style, scope and fit." />
          <AboutStep icon={<BriefcaseBusiness />} title="Post open jobs" text="Creatives can share what they need made, then manage the job status through a private link." />
          <AboutStep icon={<HeartHandshake />} title="Keep it useful" text="Recommendations and change requests go through review so the directory can stay helpful as it grows." />
        </div>
      </section>
    </>
  );
}

type AboutMedia = {
  id: string;
  title: string;
  businessName: string;
  imageUrl: string;
  mimeType?: string;
};

function getAboutMedia(businesses: Business[]): AboutMedia[] {
  return businesses
    .flatMap((business) => {
      const portfolio = business.portfolio.map((item) => ({
        id: item.id,
        title: item.title,
        businessName: business.name,
        imageUrl: item.imageUrl,
        mimeType: item.mimeType,
      }));

      return portfolio.length
        ? portfolio
        : [{
            id: `${business.id}-hero`,
            title: business.shortDescription,
            businessName: business.name,
            imageUrl: business.heroImage,
          }];
    })
    .filter((item) => Boolean(item.imageUrl))
    .slice(0, 3);
}

function AboutMediaTile({ media, className }: { media?: AboutMedia; className?: string }) {
  const isVideo = media?.mimeType?.startsWith("video/");

  return (
    <figure className={`about-media-tile relative overflow-hidden border border-[#ded8cc] bg-[#f3eee5] ${className ?? ""}`}>
      {media ? (
        isVideo ? (
          <video src={media.imageUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label={`${media.businessName} portfolio video`} />
        ) : (
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${media.imageUrl}")` }} role="img" aria-label={`${media.businessName}: ${media.title}`} />
        )
      ) : (
        <div className="flex h-full min-h-[160px] items-center justify-center p-6 text-center text-sm font-semibold text-[#315c6b]">
          Portfolio media appears here as listings grow.
        </div>
      )}
      {media ? (
        <figcaption className="about-media-caption">
          <span>{media.businessName}</span>
          <small>{media.title}</small>
        </figcaption>
      ) : null}
    </figure>
  );
}

function AboutActionCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="about-action-card border border-[#ded8cc] bg-[#fbfaf7] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#315c6b] text-[#315c6b]">{icon}</div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#6d675d]">{text}</p>
    </div>
  );
}

function AboutStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="border border-[#ded8cc] bg-[#fbfaf7] p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#315c6b] text-[#315c6b]">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#6d675d]">{text}</p>
    </article>
  );
}
