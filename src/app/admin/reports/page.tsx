import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdminSession } from "@/lib/admin-session";

export default async function ReportsPage() {
  await requireAdminSession("/admin/reports");

  return <section className="container-shell py-12"><AdminPageHeader title="Reports" /><div className="mt-8"><EmptyState title="No reports to review" description="Reported content will appear here with business, project or portfolio context." /></div></section>;
}
