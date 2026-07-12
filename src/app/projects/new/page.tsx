import type { Metadata } from "next";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = { title: "Create project brief" };

export default function NewProjectPage() {
  return (
    <section className="container-shell max-w-4xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9c4f35]">Project brief</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Tell MakeSG what you are trying to make</h1>
      <p className="mt-4 max-w-2xl text-[#6d675d]">Drafts save locally between steps in this MVP. Supabase storage and authenticated drafts are scaffolded for the next phase.</p>
      <div className="mt-10">
        <ProjectForm />
      </div>
    </section>
  );
}
