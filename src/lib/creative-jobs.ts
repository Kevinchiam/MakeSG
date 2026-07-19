import { createAdminClient } from "@/lib/supabase/admin";

export type PublicCreativeJob = {
  id: string;
  slug: string;
  title: string;
  description: string;
  intendedOutcome: string | null;
  contactName: string;
  contactEmail: string;
  companyName: string | null;
  projectType: string;
  services: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  deadline: string | null;
  preferredLocation: string | null;
  referenceLinks: string | null;
  notes: string | null;
  createdAt: string;
};

type CreativeJobRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  intended_outcome: string | null;
  contact_name: string;
  contact_email: string;
  company_name: string | null;
  project_type: string;
  services: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  preferred_location: string | null;
  reference_links: string | null;
  notes: string | null;
  created_at: string;
};

export async function getPublicCreativeJobs(): Promise<PublicCreativeJob[]> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("creative_job_listings")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return (data as CreativeJobRow[]).map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    description: job.description,
    intendedOutcome: job.intended_outcome,
    contactName: job.contact_name,
    contactEmail: job.contact_email,
    companyName: job.company_name,
    projectType: job.project_type,
    services: job.services ?? [],
    budgetMin: job.budget_min,
    budgetMax: job.budget_max,
    deadline: job.deadline,
    preferredLocation: job.preferred_location,
    referenceLinks: job.reference_links,
    notes: job.notes,
    createdAt: job.created_at,
  }));
}
