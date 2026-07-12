import { EmptyState } from "@/components/ui/empty-state";

export default function EnquiriesPage() {
  return <section className="container-shell py-12"><h1 className="font-serif text-5xl font-semibold">Enquiries</h1><div className="mt-8"><EmptyState title="No enquiries yet" description="Send an enquiry from a business profile after your project context is ready." actionHref="/businesses" actionLabel="Find a provider" /></div></section>;
}
