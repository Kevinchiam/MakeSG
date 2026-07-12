import type { AccountType, Business, Project } from "@/lib/types";

export type Principal = {
  userId: string;
  accountType: AccountType;
};

export function canEditProject(user: Principal | null, project: Pick<Project, "ownerId">) {
  return Boolean(user && (user.accountType === "admin" || user.userId === project.ownerId));
}

export function canEditBusiness(user: Principal | null, business: Pick<Business, "ownerId">) {
  return Boolean(user && (user.accountType === "admin" || user.userId === business.ownerId));
}

export function canModerate(user: Principal | null) {
  return user?.accountType === "admin";
}

export function canPublishBusiness(user: Principal | null) {
  return canModerate(user);
}
