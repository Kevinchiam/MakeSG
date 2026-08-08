import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().min(0, "Budget must be 0 or more.").optional());

const optionalBudget = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().min(0, "Budget must be 0 or more.").optional());

const optionalLeadTime = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().min(1, "Lead time must be at least 1 day.").optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return typeof value === "string" ? value.trim() : value;
}, z.string().url("Use a valid website URL.").optional());

const optionalEmail = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return typeof value === "string" ? value.trim() : value;
}, z.string().email("Use a valid public email.").optional());

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}, z.string().optional());

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
  description: z.string().min(50, "Describe the work in at least 50 characters so businesses understand the scope."),
  contactName: z.string().min(2, "Add your name."),
  contactEmail: z.string().email("Use a valid email address."),
  companyName: z.string().optional().or(z.literal("")),
  projectType: z.enum(["physical", "digital", "both"]),
  services: z.array(z.string()).default([]),
  otherService: z.string().trim().optional().or(z.literal("")),
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  deadline: z.string().optional().or(z.literal("")),
  referenceLinks: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
}).refine((data) => data.services.length > 0 || Boolean(data.otherService?.trim()), {
  message: "Choose at least one service, or describe another service.",
  path: ["services"],
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
  websiteUrl: optionalUrl,
  publicEmail: optionalEmail,
  phoneNumber: optionalText,
  location: optionalText,
  minimumBudget: optionalBudget,
  typicalLeadTime: optionalLeadTime,
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
  message: z.string().min(20, "Write a useful note for the business."),
});

export const businessRecommendationSchema = z.object({
  businessId: z.string().min(1, "Choose a business."),
  recommenderName: z.string().min(2, "Add your name."),
  recommenderEmail: z.string().email("Use a valid private email for moderation."),
  qualityRating: z.coerce.number().int().min(1, "Rate quality from 1 to 5.").max(5, "Rate quality from 1 to 5."),
  reliabilityRating: z.coerce.number().int().min(1, "Rate reliability from 1 to 5.").max(5, "Rate reliability from 1 to 5."),
  collaborationRating: z.coerce.number().int().min(1, "Rate collaboration from 1 to 5.").max(5, "Rate collaboration from 1 to 5."),
  review: z
    .string()
    .min(20, "Write a short review with at least 20 characters.")
    .max(700, "Keep reviews concise."),
  supportingLinks: z.array(z.string().url("Use valid supporting links.")).max(3, "Add up to three links.").default([]),
  permissionToPublishName: z.boolean().default(false),
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
