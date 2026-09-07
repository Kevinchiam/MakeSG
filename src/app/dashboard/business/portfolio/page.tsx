import { FileUploader } from "@/components/projects/file-uploader";

export default function PortfolioPage() {
  return (
    <section className="container-shell max-w-3xl py-12">
      <h1 className="font-serif text-5xl font-semibold">Portfolio</h1>
      <p className="mt-4 text-[#6d675d]">Add the image people should see first, then add supporting portfolio photos or short videos.</p>
      <div className="mt-8">
        <FileUploader accept="media" label="Upload a profile image and portfolio media" />
      </div>
    </section>
  );
}
