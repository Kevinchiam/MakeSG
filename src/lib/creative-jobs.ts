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
  references: CreativeJobReference[];
  notes: string | null;
  status: string;
  createdAt: string;
};

export type CreativeJobReference = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
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
  creative_job_reference_files?: CreativeJobReferenceRow[];
  notes: string | null;
  status: string;
  created_at: string;
};

type CreativeJobReferenceRow = {
  id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size_bytes: number;
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
    .select("*, creative_job_reference_files(id, file_name, file_url, mime_type, size_bytes)")
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
    references: mapReferences(job.creative_job_reference_files),
    notes: job.notes,
    status: job.status,
    createdAt: job.created_at,
  }));
}

export async function getAdminCreativeJobs(): Promise<PublicCreativeJob[]> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return [];
  }

  const { data, error } = await supabase
    .from("creative_job_listings")
    .select("*, creative_job_reference_files(id, file_name, file_url, mime_type, size_bytes)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return (data as CreativeJobRow[]).map(mapCreativeJob);
}

export async function getAdminCreativeJob(id: string): Promise<PublicCreativeJob | null> {
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("creative_job_listings")
    .select("*, creative_job_reference_files(id, file_name, file_url, mime_type, size_bytes)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return mapCreativeJob(data as CreativeJobRow);
}

function mapCreativeJob(job: CreativeJobRow): PublicCreativeJob {
  return {
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
    references: mapReferences(job.creative_job_reference_files),
    notes: job.notes,
    status: job.status,
    createdAt: job.created_at,
  };
}

function mapReferences(references: CreativeJobReferenceRow[] | undefined): CreativeJobReference[] {
  return (references ?? []).map((reference) => ({
    id: reference.id,
    fileName: reference.file_name,
    fileUrl: reference.file_url,
    mimeType: reference.mime_type,
    sizeBytes: reference.size_bytes,
  }));
}
