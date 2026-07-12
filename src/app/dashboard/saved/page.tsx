import { EmptyState } from "@/components/ui/empty-state";

export default function SavedPage() {
  return <section className="container-shell py-12"><h1 className="font-serif text-5xl font-semibold">Saved businesses</h1><div className="mt-8"><EmptyState title="No saved businesses yet" description="Use the save button on provider profiles to build a shortlist." actionHref="/businesses" actionLabel="Browse providers" /></div></section>;
}
