import { z } from "zod";

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
  services: z.array(z.string()).min(1, "Select at least one service."),
  materials: z.array(z.string()).default([]),
});

export const enquirySchema = z.object({
  projectId: z.string().min(1),
  businessId: z.string().min(1),
  message: z.string().min(20, "Write a useful note for the provider."),
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
