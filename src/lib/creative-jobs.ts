import { createAdminClient } from "@/lib/supabase/admin";
import type { ModerationDecision, ModerationRisk } from "@/lib/types";

export const creativeJobStatuses = ["pending_review", "open", "in_discussion", "taken", "closed", "archived"] as const;

export type CreativeJobStatus = typeof creativeJobStatuses[number];

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
  referenceLinks: string | null;
  references: CreativeJobReference[];
  notes: string | null;
  status: CreativeJobStatus;
  manageToken: string | null;
  createdAt: string;
  moderationDecision: ModerationDecision | null;
  moderationRisk: ModerationRisk | null;
  moderationReason: string | null;
  moderationSignals: string[];
};

export type CreativeJobReference = {
  id: string;
  fileName: string;
  caption: string | null;
  fileUrl: string;
  storagePath: string;
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
  reference_links: string | null;
  creative_job_reference_files?: CreativeJobReferenceRow[];
  notes: string | null;
  status: CreativeJobStatus;
  manage_token: string | null;
  created_at: string;
  moderation_decision?: ModerationDecision | null;
  moderation_risk?: ModerationRisk | null;
  moderation_reason?: string | null;
  moderation_signals?: unknown;
};

type CreativeJobReferenceRow = {
  id: string;
  file_name: string;
  caption: string | null;
  file_url: string;
  storage_path: string;
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
    .select("*, creative_job_reference_files(id, file_name, caption, file_url, storage_path, mime_type, size_bytes)")
    .in("status", ["open", "in_discussion"])
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
    referenceLinks: job.reference_links,
    references: mapReferences(job.creative_job_reference_files),
    notes: job.notes,
    status: job.status,
    manageToken: job.manage_token,
    createdAt: job.created_at,
    moderationDecision: job.moderation_decision ?? null,
    moderationRisk: job.moderation_risk ?? null,
    moderationReason: job.moderation_reason ?? null,
    moderationSignals: stringArrayFromJson(job.moderation_signals),
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
    .select("*, creative_job_reference_files(id, file_name, caption, file_url, storage_path, mime_type, size_bytes)")
    .neq("status", "archived")
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
    .select("*, creative_job_reference_files(id, file_name, caption, file_url, storage_path, mime_type, size_bytes)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return mapCreativeJob(data as CreativeJobRow);
}

export async function getCreativeJobByManageToken(token: string): Promise<PublicCreativeJob | null> {
  if (!token) return null;

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("creative_job_listings")
    .select("*, creative_job_reference_files(id, file_name, caption, file_url, storage_path, mime_type, size_bytes)")
    .eq("manage_token", token)
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
    referenceLinks: job.reference_links,
    references: mapReferences(job.creative_job_reference_files),
    notes: job.notes,
    status: job.status,
    manageToken: job.manage_token,
    createdAt: job.created_at,
    moderationDecision: job.moderation_decision ?? null,
    moderationRisk: job.moderation_risk ?? null,
    moderationReason: job.moderation_reason ?? null,
    moderationSignals: stringArrayFromJson(job.moderation_signals),
  };
}

export function creativeJobStatusLabel(status: CreativeJobStatus) {
  switch (status) {
    case "pending_review":
      return "Pending review";
    case "open":
      return "Open";
    case "in_discussion":
      return "In discussion";
    case "taken":
      return "Taken";
    case "closed":
      return "Taken";
    case "archived":
      return "In trash";
  }
}

function mapReferences(references: CreativeJobReferenceRow[] | undefined): CreativeJobReference[] {
  return (references ?? []).map((reference) => ({
    id: reference.id,
    fileName: reference.file_name,
    caption: reference.caption,
    fileUrl: reference.file_url,
    storagePath: reference.storage_path,
    mimeType: reference.mime_type,
    sizeBytes: reference.size_bytes,
  }));
}

function stringArrayFromJson(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
