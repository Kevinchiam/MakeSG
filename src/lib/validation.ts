import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().min(0, "Budget must be 0 or more.").optional());

export const projectSchema = z.object({
  title: z.string().min(3, "Add a short project title."),
  description: z.string().min(20, "Describe the idea in at least 20 characters."),
  intendedOutcome: z.string().min(3, "Tell providers what success looks like."),
  projectType: z.enum(["physical", "digital", "both"]),
  quantity: z.string().optional(),
  dimensions: z.string().optional(),
  materials: z.array(z.string()).default([]),
  knownServices: z.array(z.string()).default([]),
  prototypeOrProduction: z.enum(["prototype", "production", "both"]),
  preferredLocation: z.string().optional(),
  budgetMin: z.coerce.number().nonnegative().optional(),
  budgetMax: z.coerce.number().nonnegative().optional(),
  deadline: z.string().optional(),
  deadlineFlexibility: z.string().optional(),
  referenceLinks: z.string().optional(),
});

export const creativeJobSchema = z.object({
  title: z.string().min(3, "Add a short job title."),
  description: z.string().min(40, "Share enough detail for providers to understand the work."),
  intendedOutcome: z.string().min(8, "Tell providers what a good outcome looks like."),
  contactName: z.string().min(2, "Add your name."),
  contactEmail: z.string().email("Use a valid email address."),
  companyName: z.string().optional().or(z.literal("")),
  projectType: z.enum(["physical", "digital", "both"]),
  services: z.array(z.string()).min(1, "Choose at least one service you need."),
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  deadline: z.string().optional().or(z.literal("")),
  preferredLocation: z.string().optional().or(z.literal("")),
  referenceLinks: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.budgetMin === undefined || data.budgetMax === undefined) return true;
  return data.budgetMax >= data.budgetMin;
}, {
  message: "Maximum budget should be higher than the minimum budget.",
  path: ["budgetMax"],
});

export const businessSchema = z.object({
  name: z.string().min(2, "Business name is required."),
  shortDescription: z.string().min(20, "Add a concise summary."),
  description: z.string().min(80, "Add more detail for creative clients."),
  websiteUrl: z.string().url("Use a valid website URL."),
  publicEmail: z.string().email("Use a valid public email."),
  location: z.string().min(2, "Choose a Singapore location."),
  minimumBudget: z.coerce.number().min(0),
  typicalLeadTime: z.coerce.number().min(1),
  businessType: z.enum(["independent", "studio", "workshop", "consultancy", "manufacturer", "supplier"]),
  services: z.array(z.string()).default([]),
  otherService: z.string().trim().optional().or(z.literal("")),
}).refine((data) => data.services.length > 0 || Boolean(data.otherService?.trim()), {
  message: "Select at least one service, or describe another service.",
  path: ["services"],
});

export const enquirySchema = z.object({
  projectId: z.string().min(1),
  businessId: z.string().min(1),
  message: z.string().min(20, "Write a useful note for the provider."),
});

export const businessRecommendationSchema = z.object({
  businessId: z.string().min(1, "Choose a business."),
  businessName: z.string().optional(),
  recommenderName: z.string().min(2, "Add your name."),
  recommenderRole: z.string().optional(),
  recommenderEmail: z.string().email("Use a valid email.").optional().or(z.literal("")),
  relationship: z.enum(["client", "collaborator", "supplier", "peer", "other"]),
  projectContext: z.string().min(8, "Share what kind of project you worked on."),
  recommendedFor: z.array(z.string()).min(1, "Choose at least one strength."),
  comment: z
    .string()
    .min(30, "Share a little more about the experience.")
    .max(500, "Keep recommendations concise."),
  permissionToContact: z.boolean().default(false),
  permissionToPublishName: z.boolean().default(false),
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
