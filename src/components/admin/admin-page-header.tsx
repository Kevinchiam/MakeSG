import Link from "next/link";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function AdminPageHeader({ eyebrow, title, description }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">{eyebrow}</p> : null}
        <h1 className="mt-2 break-words font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-2xl text-[#6d675d]">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin" className="underline">Admin home</Link>
        <Link href="/admin/logout" className="underline">Log out</Link>
      </div>
    </div>
  );
}
