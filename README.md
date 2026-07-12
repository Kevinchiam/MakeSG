# MakeSG

MakeSG is a production-ready MVP scaffold for a Singapore creative-services and fabrication directory. It uses Next.js App Router, TypeScript, Tailwind CSS, shadcn-style primitives, Supabase-ready Postgres/Auth/Storage, React Hook Form, Zod, Lucide, Vitest and Playwright.

All included business data is fictional demo data. Images are generated geometric SVG placeholders served locally.

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Apply `supabase/migrations/0001_initial_schema.sql`.
5. Run `supabase/seed/seed.sql` for demo service, material and business records.
6. Enable email magic links in Supabase Auth.
7. For Google OAuth, create OAuth credentials, add the Supabase callback URL in Google Cloud, then add the client ID and secret in Supabase Auth providers.

## Storage Buckets

The migration creates:

- `avatars`
- `business-portfolios`
- `project-references`

Allowed files are JPG, PNG, WebP and PDF where appropriate, with bucket-level size limits.

## Admin Account

Create a user through Supabase Auth, then update their profile:

```sql
update profiles set account_type = 'admin' where user_id = '<auth-user-id>';
```

## Architecture

The app keeps database access out of presentational components. UI components receive typed data, shared validation lives in `src/lib/validation.ts`, recommendations live in `src/lib/recommendation.ts`, and Supabase clients live in `src/lib/supabase`.

## Deployment

Deploy to Vercel with the environment variables from `.env.example`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Known Limitations

- Current UI uses local mock repositories so it can run without Supabase credentials.
- Enquiry and save actions are local interactive placeholders until wired to server actions.
- Public reviews, live chat, payments and AI recommendations are intentionally excluded.

## Roadmap

- Replace mock data with Supabase repository functions.
- Add server actions for projects, enquiries, saved businesses and moderation.
- Add richer portfolio management and image transformations.
- Add rate limiting middleware for enquiry endpoints.
