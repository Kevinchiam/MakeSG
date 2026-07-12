import { FileUploader } from "@/components/projects/file-uploader";

export default function PortfolioPage() {
  return <section className="container-shell max-w-3xl py-12"><h1 className="font-serif text-5xl font-semibold">Portfolio</h1><p className="mt-4 text-[#6d675d]">Upload portfolio images or PDFs for a business listing.</p><div className="mt-8"><FileUploader /></div></section>;
}
