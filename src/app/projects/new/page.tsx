import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Create project brief" };

export default function NewProjectPage() {
  redirect("/for-creatives");
}
