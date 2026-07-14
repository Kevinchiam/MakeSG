export type AccountType = "creative" | "provider" | "admin";
export type BusinessType =
  | "independent"
  | "studio"
  | "workshop"
  | "consultancy"
  | "manufacturer"
  | "supplier";
export type PublicationStatus = "draft" | "pending" | "published" | "rejected" | "suspended";
export type VerificationStatus = "unverified" | "claimed" | "verified";
export type ProjectType = "physical" | "digital" | "both";
export type ProjectScale = "one-off" | "prototype" | "small-batch" | "production" | "installation";
export type BusinessRecommendationStatus = "pending" | "approved" | "rejected";

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  group: string;
};

export type Material = {
  id: string;
  name: string;
  slug: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
};

export type Business = {
  id: string;
  ownerId?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  websiteUrl: string;
  publicEmail: string;
  publicPhone?: string;
  location: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  showFullAddress: boolean;
  minimumBudget: number;
  typicalLeadTime: number;
  businessType: BusinessType;
  acceptsPrototypes: boolean;
  acceptsProduction: boolean;
  offersOnsiteService: boolean;
  offersRemoteService: boolean;
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  claimed: boolean;
  endorsementCount: number;
  services: string[];
  materials: string[];
  processes: string[];
  projectTypes: ProjectScale[];
  portfolio: PortfolioItem[];
  heroImage: string;
  demoNotice: string;
};

export type BusinessRecommendation = {
  id: string;
  businessId: string;
  recommenderName: string;
  recommenderRole?: string;
  recommenderEmail?: string;
  relationship: "client" | "collaborator" | "supplier" | "peer" | "other";
  projectContext: string;
  recommendedFor: string[];
  comment: string;
  mediaUrls?: string[];
  permissionToContact: boolean;
  permissionToPublishName: boolean;
  status: BusinessRecommendationStatus;
  createdAt: string;
};

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  intendedOutcome: string;
  projectType: ProjectType;
  quantity?: string;
  dimensions?: string;
  materials: string[];
  knownServices: string[];
  prototypeOrProduction: "prototype" | "production" | "both";
  preferredLocation?: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: string;
  deadlineFlexibility?: string;
  status: "draft" | "seeking_providers" | "in_progress" | "completed" | "archived";
};

export type BusinessFilters = {
  q?: string;
  service?: string;
  material?: string;
  location?: string;
  mode?: "prototype" | "production";
  minBudget?: number;
  leadTime?: number;
  businessType?: BusinessType;
  delivery?: "onsite" | "remote";
  verified?: boolean;
};
