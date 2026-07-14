import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#ded8cc] bg-[#211f1b] text-white">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl font-semibold">MakeSG</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#d8d0c4]">
            A directory for fictional demo data today, designed for Singapore creative services and fabrication workflows tomorrow.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#d8d0c4]">Browse</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/services">Services</Link>
            <Link href="/businesses">Businesses</Link>
            <Link href="/recommend-business">Recommend a business</Link>
            <Link href="/projects/new">Submit a project</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#d8d0c4]">Platform</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <Link href="/for-businesses">For businesses</Link>
            <Link href="/about">About</Link>
            <Link href="/admin/login">Admin login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
