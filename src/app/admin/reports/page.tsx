import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReportsPage() {
  return <section className="container-shell py-12"><AdminPageHeader title="Reports" /><div className="mt-8"><EmptyState title="No reports to review" description="Reported content will appear here with business, project or portfolio context." /></div></section>;
}
