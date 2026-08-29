# MakeSG Project Context

Last updated: 2026-08-29

## Project Overview

### Purpose
MakeSG is a Singapore-focused directory and marketplace prototype that helps creatives find trusted businesses for fabrication, production, photography, videography, design, and specialist making services. It also lets businesses onboard themselves and lets creatives post jobs that businesses can browse.

### Vision
MakeSG should become a trusted word-of-mouth layer for Singapore's creative production ecosystem: a place where real makers, studios, suppliers, and service businesses can be discovered through structured listings, moderated recommendations, portfolios, and practical job briefs.

### Target Audience
- Creatives, designers, artists, founders, agencies, and students looking for reliable businesses to help make ideas real.
- Fabricators, studios, photographers, videographers, workshops, consultants, manufacturers, and suppliers who want relevant creative work.
- MakeSG admins who moderate listings, recommendations, reports, and creative jobs.

### Problem Being Solved
Creative production relies heavily on word of mouth, but reliable service discovery is fragmented across personal networks, social media, and search engines. MakeSG centralises business discovery, recommendation, onboarding, moderation, and job posting so people can find credible help faster.

## Product Goals

### MVP Objectives
- Publish a usable public directory of Singapore creative-production businesses.
- Allow businesses to submit listings with services, budget, lead time, email, website, and portfolio media.
- Allow people to recommend businesses they have tried.
- Allow admins to moderate business listings, recommendations, and creative jobs.
- Allow creatives to post public job listings without account creation.
- Allow creatives to manage posted jobs through a private manage link.
- Add helpful fallback captions for uploaded media when contributors leave captions blank.
- Keep rejected and dismissed items in an admin-only trash bin before permanent cleanup.
- Provide direct contact routes through visible email or mailto links, with Resend support when configured.

### Future Roadmap
- Replace remaining dashboard placeholders with fully persisted Supabase workflows.
- Add robust user accounts for business owners and optional creative accounts.
- Add moderation queues with richer status history and admin notes.
- Add stronger search ranking, synonyms, and possibly AI-assisted service matching.
- Add map/location search once a custom geocoding provider is selected.
- Add notification emails for creative job submissions and changes.
- Add rate limiting, abuse detection, and spam protection.
- Add scheduled trash cleanup through Vercel Cron or Supabase scheduled jobs.
- Add AI-assisted image captioning and image/content moderation after a provider and privacy approach are selected.
- Add analytics for search-to-contact conversion and successful job closure.

### Success Metrics
- Number of published businesses.
- Number of approved recommendations.
- Number of creative jobs posted.
- Percentage of creative jobs moved from Open to In discussion or Taken.
- Search-to-profile and profile-to-contact conversion.
- Percentage of submitted business listings approved without admin rework.
- Median time from listing submission to approval.

## Tech Stack

### Framework
- Next.js 16 App Router.

### Languages
- TypeScript.
- SQL for Supabase migrations.
- CSS through Tailwind CSS 4 utilities and CSS custom properties.

### Database
- Supabase Postgres.
- Row Level Security policies are defined in migrations.

### Hosting
- Vercel.

### Third-Party APIs
- Supabase Auth, Postgres, Storage.
- Resend for email delivery when configured.

### Authentication
- Supabase Auth exists for general user-facing auth scaffolding.
- Admin currently uses a simple private cookie-based login via `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_TOKEN`.
- Creative job management uses private random manage tokens instead of account creation.

### Search
- Local server-side filtering in `src/lib/filters.ts`.
- Search uses token matching and Levenshtein typo tolerance against business listing text, services, portfolio text, and descriptions.

### Maps
- Database supports address, postal code, latitude, and longitude fields.
- No map provider is currently wired into the UI.

### Deployment
- GitHub to Vercel.
- Build command: `pnpm build`.
- Install command: `pnpm install`.
- Environment variables are documented in `.env.example` and `README.md`.

## Folder Structure

- `src/app`: Next.js App Router pages, route handlers, loading/error/not-found states, sitemap, robots, admin pages, public pages, dashboard placeholders, and auth callback.
- `src/components`: Reusable UI and domain components.
- `src/components/admin`: Admin page headers, moderation controls, delete controls, and server actions for admin-managed data.
- `src/components/business`: Business cards, filter UI, enquiry form, recommendation form, badges, and directory display components.
- `src/components/projects`: Project brief and file-upload UI shared by project and media flows.
- `src/components/site`: Site header, footer, mobile navigation, admin shortcut, and search bar.
- `src/components/ui`: Small design-system primitives such as buttons, inputs, textareas, badges, pagination, skeletons, and empty states.
- `src/features`: Feature-specific workflows that combine UI and server actions.
- `src/features/businesses`: Business onboarding form and submission action.
- `src/features/creative-jobs`: Creative job posting, private job management, status management, listing-detail editing, media editing, and server actions.
- `src/lib`: Shared data access, types, validation, permissions, filters, Supabase clients, email utilities, media caption helpers, admin trash cleanup, slugging, service data, and lightweight local placeholders.
- `src/lib/admin-trash.ts`: Admin-only trash-bin aggregation and seven-day cleanup helper for rejected/dismissed listings and media.
- `src/lib/media-captions.ts`: Shared smart fallback caption helper for uploaded photos/videos.
- `src/lib/supabase`: Supabase browser, server, and admin client setup.
- `src/lib/email`: Resend email templates and sending wrapper.
- `src/lib/analytics`: Analytics event typing placeholder.
- `supabase/migrations`: Ordered SQL migrations for schema, storage buckets, RLS, recommendations, media, legacy compatibility fields, creative jobs, and status changes.
- `supabase/seed`: Demo data seed script.
- `tests/unit`: Vitest unit tests for filtering, permissions, recommendation logic, slugging, and validation.
- `tests/e2e`: Playwright end-to-end tests for major user flows.
- `docs`: Planning and implementation notes.
- `public`: Public static assets.
- `AI_RULES.md`: Repository-level AI collaboration rules for long-term product quality, design consistency, documentation discipline, and implementation standards.

## Architecture

### Frontend
The frontend is built with Next.js App Router. Server components fetch data and compose pages. Client components handle forms, local UI state, uploads, navigation toggles, and optimistic interactions. Styling uses Tailwind utility classes plus global CSS variables in `src/app/globals.css`.

### Backend
Backend logic is implemented with Next.js server actions and route handlers. Supabase admin access is kept in server-only functions. Validation is shared through Zod schemas in `src/lib/validation.ts`.

### Database
Supabase Postgres stores profiles, businesses, services, materials, business joins, portfolio items, projects, enquiries, saved businesses, reports, business recommendations, recommendation media, creative jobs, and creative job reference files.

### API Flow
Most mutations use server actions:
- Forms build `FormData` or typed objects.
- Server actions validate with Zod.
- Server actions use `createAdminClient()` for trusted inserts/updates.
- Pages are revalidated with `revalidatePath()` when visible data changes.
- UI displays success/error messages and scrolls to feedback when appropriate.

### Authentication Flow
- Public browsing does not require login.
- Admin pages are protected in `middleware.ts`.
- Admin login writes an HTTP-only `makesg_admin` cookie if credentials match configured environment variables.
- Site header reads the admin cookie server-side and shows an admin shortcut only when the cookie is valid.
- Supabase Auth and callback scaffolding exist for future user accounts.
- Creative job owners do not need accounts; they receive a private manage URL containing a long random token.

### Data Flow
- Public business pages call `getPublishedBusinesses()` or `getPublishedBusinessBySlug()` in `src/lib/public-businesses.ts`.
- Public creative jobs call `getPublicCreativeJobs()` in `src/lib/creative-jobs.ts`.
- Business onboarding inserts into Supabase and uploads portfolio media.
- Business onboarding, business edits, business recommendations, change requests, and creative jobs run through rule-based moderation triage before saving.
- Blank upload captions receive a simple, context-aware fallback before media records are saved.
- Rejected business listings, rejected listing edits, rejected recommendations, dismissed change requests, and archived creative jobs are treated as trash-bin items and are permanently deleted after seven days when the admin dashboard or trash page runs cleanup.
- Creative job submission inserts a job, stores a manage token, uploads reference files, and returns the private manage link. Low-risk creative jobs auto-publish; higher-risk jobs use `pending_review`.
- Admin pages call admin data helpers, show automated triage decisions/signals, and update moderation status with server actions.

## Features

### Public Home
Status: Completed

Description: Landing/search entry for MakeSG with editorial visual direction, CSS-only motion, live directory counts, current platform feature copy, and up to six homepage business highlights ranked by recommendations, featured status, and latest updates.

Relevant files:
- `src/app/page.tsx`
- `src/components/site/search-bar.tsx`
- `src/lib/public-businesses.ts`
- `src/app/globals.css`

Future improvements:
- Add richer dynamic previews from creative jobs and recommendations.
- Track search conversion.

### Business Directory
Status: Completed

Description: Browse published businesses with filters, typo-tolerant search, cards, pagination, empty states, a Recommended-only filter, recommendation labels, and public change-request panels that save into the admin dashboard.

Relevant files:
- `src/app/businesses/page.tsx`
- `src/app/admin/change-requests/page.tsx`
- `src/components/business/business-grid.tsx`
- `src/components/business/business-card.tsx`
- `src/components/business/request-business-change-panel.tsx`
- `src/components/admin/business-change-request-controls.tsx`
- `src/components/business/filter-panel.tsx`
- `src/components/business/mobile-filter-drawer.tsx`
- `src/lib/business-change-requests.ts`
- `src/lib/public-businesses.ts`
- `src/lib/filters.ts`

Future improvements:
- Add service synonyms and query analytics.
- Remove material filters if no longer part of product direction.

### Business Profile
Status: Completed

Description: Public business profile with hero media, service details, portfolio media, visible email fallback, website link, location, budget, lead time, and recommendation CTA.

Relevant files:
- `src/app/businesses/[slug]/page.tsx`
- `src/components/business/enquiry-form.tsx`
- `src/components/business/enquiry-actions.ts`

Future improvements:
- Add structured contact analytics.
- Support claimed-business editing with owner authentication.

### Business Enquiry
Status: In Progress

Description: Lets users submit enquiries. If Resend is configured, enquiries are emailed to the business public email. If email is not configured or fails, the UI shows a direct email fallback.

Relevant files:
- `src/components/business/enquiry-form.tsx`
- `src/components/business/enquiry-actions.ts`
- `src/lib/email/index.ts`

Future improvements:
- Add rate limiting and spam prevention.
- Persist enquiries in Supabase.
- Add business/creative confirmation emails.

### Business Onboarding
Status: Completed

Description: Businesses or community members can submit listing details, service options including Other, optional website/email/phone/location/budget/lead time, and portfolio photos/videos. Submissions run through automated triage for abusive/spam wording, suspicious patterns, risky filenames, and low-detail signals, then enter review before publication. Blank media captions are filled with a simple smart fallback based on the filename and business context. After submission, submitters receive a private edit link that can update listing details and portfolio media. Edits to already published listings create a pending revision, so the current approved public listing stays live until an admin approves the changes.

Relevant files:
- `src/app/for-businesses/page.tsx`
- `src/features/businesses/business-listing-form.tsx`
- `src/app/businesses/manage/[token]/page.tsx`
- `src/features/businesses/manage-business-details.tsx`
- `src/features/businesses/manage-business-media.tsx`
- `src/features/businesses/actions.ts`
- `src/components/projects/file-uploader.tsx`
- `src/lib/media-captions.ts`
- `supabase/migrations/0003_media_uploads.sql`
- `supabase/migrations/0010_business_manage_links.sql`
- `supabase/migrations/0011_business_listing_revisions.sql`
- `supabase/migrations/0014_moderation_triage.sql`

Future improvements:
- Add regenerate/revoke manage link.
- Email manage link to the business once email delivery is configured.
- Add clearer admin rejection feedback loop.

### Business Recommendations
Status: Completed

Description: Users can recommend businesses based on real experience. Recommendations are checked for obvious abuse/spam and reviewed before public use. Recommendation media also receives a smart fallback caption when contributors leave captions blank.

Relevant files:
- `src/app/recommend-business/page.tsx`
- `src/components/business/recommend-business-form.tsx`
- `src/components/business/recommend-business-panel.tsx`
- `src/components/business/recommendation-actions.ts`
- `src/lib/media-captions.ts`
- `src/lib/recommendation.ts`
- `supabase/migrations/0002_business_recommendations.sql`
- `supabase/migrations/0014_moderation_triage.sql`

Future improvements:
- Persist recommendation media in public display.
- Add recommendation editing before approval.

### Business Duplicate Prevention
Status: Completed

Description: Similar business names prompt users to view an existing listing instead of creating duplicates. The old endorsement UI has been removed so recommendations remain the single public word-of-mouth action.

Relevant files:
- `src/features/businesses/business-listing-form.tsx`
- `src/app/recommend-business/page.tsx`
- `src/components/business/recommend-business-lookup.tsx`

Future improvements:
- Add stronger fuzzy matching and admin merge tools for accidental duplicates.

### Creative Job Posting
Status: Completed

Description: Creatives can publish public job listings for businesses to browse. Jobs include title, description, contact email, project type, services, optional other service, budget, deadline, notes, and reference uploads with captions. Blank reference captions are auto-filled with a friendly fallback. Low-risk jobs are auto-published after validation and moderation triage; higher-risk jobs are held as `pending_review` for admin approval.

Relevant files:
- `src/app/for-creatives/page.tsx`
- `src/features/creative-jobs/creative-job-listing-form.tsx`
- `src/features/creative-jobs/actions.ts`
- `src/lib/creative-jobs.ts`
- `src/lib/media-captions.ts`
- `src/lib/validation.ts`
- `supabase/migrations/0005_creative_job_listings.sql`
- `supabase/migrations/0006_creative_job_references.sql`
- `supabase/migrations/0014_moderation_triage.sql`

Future improvements:
- Email the private manage link after submission once sender/domain setup is ready.
- Add AI image moderation or third-party trust checks if creative job volume grows.

### Public Creative Jobs
Status: Completed

Description: Businesses can browse open and in-discussion creative jobs and contact creatives by email.

Relevant files:
- `src/app/creative-jobs/page.tsx`
- `src/lib/creative-jobs.ts`

Future improvements:
- Add filters by service, deadline, budget, and project type.
- Add search across creative jobs.

### Private Creative Job Management
Status: Completed

Description: After posting, creatives receive a private manage link. The manage page allows status changes, listing-detail edits, media additions/removals, and caption edits without requiring an account.

Relevant files:
- `src/app/creative-jobs/manage/[token]/page.tsx`
- `src/features/creative-jobs/manage-creative-job-status.tsx`
- `src/features/creative-jobs/manage-creative-job-details.tsx`
- `src/features/creative-jobs/manage-creative-job-media.tsx`
- `src/features/creative-jobs/actions.ts`
- `supabase/migrations/0008_creative_job_manage_links.sql`
- `supabase/migrations/0009_remove_closed_creative_job_status.sql`

Future improvements:
- Add regenerate/revoke manage link.
- Email manage link to the creative.
- Add audit log for status and listing edits.

### Admin Login
Status: Completed

Description: Simple admin-only login protects admin routes through middleware and a secure HTTP-only cookie.

Relevant files:
- `middleware.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/login/actions.ts`
- `src/app/admin/logout/route.ts`
- `src/components/site/site-header.tsx`
- `src/components/site/site-header-client.tsx`

Future improvements:
- Replace static admin credentials with Supabase role-based admin accounts.
- Add rate limiting.

### Admin Dashboard
Status: Completed

Description: Admin home with links to business moderation, creative jobs, recommendations, services, reports, and the trash bin. It highlights pending queues, high-risk automated triage items, and trashed items waiting for seven-day cleanup.

Relevant files:
- `src/app/admin/page.tsx`
- `src/app/admin/trash/page.tsx`
- `src/components/admin/admin-page-header.tsx`
- `src/components/admin/moderation-summary.tsx`
- `src/lib/admin-trash.ts`

Future improvements:
- Add activity feed.

### Admin Business Moderation
Status: Completed

Description: Admin can review, approve, reject, feature, unpublish, and delete business listings. New listings and pending edits show automated triage risk, reason, and signals to streamline review while preserving admin override. Rejected listings and rejected pending edits move out of the main queues into the admin trash bin for seven days before cleanup.

Relevant files:
- `src/app/admin/businesses/page.tsx`
- `src/app/admin/businesses/[id]/page.tsx`
- `src/components/admin/admin-status-controls.tsx`
- `src/components/admin/moderation-summary.tsx`
- `src/components/admin/actions.ts`

Future improvements:
- Add admin notes and audit history for moderation outcomes.

### Admin Creative Job Management
Status: Completed

Description: Admin can view, edit, status-change, move to trash, and delete creative jobs. Creative jobs flagged by automated triage can be held in `pending_review` until an admin opens or moves them to trash.

Relevant files:
- `src/app/admin/creative-jobs/page.tsx`
- `src/app/admin/creative-jobs/[id]/page.tsx`
- `src/components/admin/admin-creative-job-delete-button.tsx`
- `src/components/admin/moderation-summary.tsx`
- `src/components/admin/actions.ts`

Future improvements:
- Add media editing from admin.
- Add job activity timeline.

### Admin Trash Bin
Status: Completed

Description: Admin-only trash view that collects rejected business listings, rejected business listing edits, rejected recommendations, dismissed change requests, and creative jobs moved to trash. Admins can restore items back to their review queues before deletion. Items remain visible for seven days, then the cleanup helper permanently deletes expired rows and associated Supabase Storage objects when the admin dashboard or trash page is visited.

Relevant files:
- `src/app/admin/trash/page.tsx`
- `src/components/admin/restore-trash-item-button.tsx`
- `src/lib/admin-trash.ts`
- `src/app/admin/page.tsx`
- `src/components/admin/actions.ts`
- `src/components/admin/admin-status-controls.tsx`
- `src/components/admin/business-change-request-controls.tsx`
- `supabase/migrations/0015_admin_trash_retention.sql`

Future improvements:
- Move cleanup to a scheduled Vercel Cron or Supabase scheduled job.
- Add an audit log that records who moved each item to trash.

### Dashboard Pages
Status: In Progress

Description: Dashboard, project, saved business, enquiry, and business management pages exist as scaffolds but are not all fully wired to persisted user workflows.

Relevant files:
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/projects/page.tsx`
- `src/app/dashboard/projects/[id]/page.tsx`
- `src/app/dashboard/business/page.tsx`
- `src/app/dashboard/business/edit/page.tsx`
- `src/app/dashboard/business/portfolio/page.tsx`
- `src/app/dashboard/enquiries/page.tsx`
- `src/app/dashboard/saved/page.tsx`

Future improvements:
- Decide whether dashboards remain in MVP or are hidden until account system is ready.

## Database Schema

### `profiles`
Stores Supabase-authenticated user profile metadata. Links to `auth.users` through `user_id`.

### `services`
Canonical service categories used for businesses and creative job service selection.

### `materials`
Original material taxonomy. It still exists in the schema but the current business onboarding UI removed the materials section.

### `businesses`
Core business listings with owner, publication status, verification status, contact details, address, budget, lead time, capabilities, hero image, and automated moderation triage metadata. Rejected rows are treated as trash-bin items and are permanently deleted after the seven-day retention period.

### `business_services`
Many-to-many join between businesses and services.

### `business_materials`
Many-to-many join between businesses and materials. Currently lower priority because material selection was removed from onboarding.

### `portfolio_items`
Portfolio records for business profiles. Stores image URLs, descriptions, tags, and sort order.

### `projects`
Original authenticated project brief model. Still used by dashboard/project scaffolding.

### `project_files`
Files attached to authenticated projects.

### `project_service_matches`
Stores service match scores and explanations for project recommendations.

### `enquiries`
Persisted enquiry schema for authenticated workflows. Current public enquiry flow sends email and does not yet persist here.

### `saved_businesses`
Join table for user-saved businesses.

### `reports`
Stores reported content for admin review.

### `business_recommendations`
Word-of-mouth recommendation submissions tied to a business, with recommender details, relationship, strengths, comment, permissions, moderation status, and automated triage metadata. Rejected rows appear in the admin trash bin before cleanup.

### `business_recommendation_media`
Media attached to business recommendations. Blank captions receive fallback captions before save; media for expired rejected recommendations is removed from storage during trash cleanup.

### `business_change_requests`
Public requests to correct or update an existing business listing. Each request stores the target business, requester email, reason, admin notes, status, automated triage metadata, and timestamps. Admins review these from `/admin/change-requests` and manually update the listing if the request is valid. Dismissed rows appear in the admin trash bin before cleanup.

### `business_listing_revisions`
Pending edits for published business listings. Stores proposed listing data, proposed services, proposed portfolio media, revision status, and automated triage metadata. Approved revisions overwrite the live listing; rejected revisions leave the live listing unchanged and appear in the admin trash bin before cleanup.

### `creative_job_listings`
Public creative jobs. Important fields include `title`, `slug`, `description`, `contact_email`, `project_type`, `services`, `service_slugs`, `other_service`, `budget_min`, `budget_max`, `deadline`, `notes`, `status`, `manage_token`, and automated triage metadata. Archived rows are treated as trash-bin items and are permanently deleted after the seven-day retention period.

Relationships:
- `creative_job_reference_files.job_id` references `creative_job_listings.id`.
- Public readers can see jobs with `open` or `in_discussion` status.
- `pending_review`, `taken`, `closed`, and `archived` jobs are hidden publicly.

### `creative_job_reference_files`
Photos/videos attached to creative jobs. Stores storage bucket/path, public URL, filename, caption, mime type, size, and sort order. Blank captions receive fallback captions before save; media for expired archived jobs is removed from storage during trash cleanup.

### Storage Buckets
- `avatars`: public profile avatars.
- `business-portfolios`: public business and recommendation media.
- `project-references`: private project files.
- `creative-job-references`: public creative job reference media.

Trash cleanup removes related files from `business-portfolios` and `creative-job-references` before deleting expired database rows.

## API Endpoints

### Route Handlers
- `GET /auth/callback`: Supabase auth callback that exchanges auth code and upserts profile metadata.
- `GET /admin/logout`: Clears the admin cookie and redirects to admin login.
- `GET /demo/[slug]`: Serves demo SVG image assets.
- `GET /robots.txt`: Generated by `src/app/robots.ts`.
- `GET /sitemap.xml`: Generated by `src/app/sitemap.ts`.

### Server Actions
- `loginAdmin(formData)`: Validates admin credentials and sets `makesg_admin` cookie.
- `updateBusinessPublicationStatus(businessId, status)`: Admin moderation of business publication status.
- `deleteBusinessEntry(businessId)`: Admin deletion of business listing.
- `getAdminTrashItems({ purgeExpired })`: Admin helper that lists trash-bin items and optionally purges expired rows/media.
- `requestBusinessChange(formData)`: Public business-card correction request saved for admin review.
- `updateBusinessChangeRequestStatus(requestId, status, adminNotes)`: Admin review status update for public change requests.
- `updateCreativeJobFromForm(jobId, formData)`: Admin edit of creative job listing.
- `deleteCreativeJobEntry(jobId)`: Admin deletion of creative job.
- `submitBusinessListing(input)`: Business onboarding submission and portfolio upload.
- `submitCreativeJobListing(input)`: Creative job creation, reference upload, and manage-token generation.
- `updateCreativeJobStatusByToken(token, status)`: Private status update for creative jobs.
- `updateCreativeJobDetailsByToken(token, input)`: Private listing-detail update for creative jobs.
- `updateCreativeJobMediaByToken(token, formData)`: Private creative job media add/remove/caption update.
- `sendBusinessEnquiry(input)`: Sends enquiry email or returns contact fallback.
- `smartMediaCaption(input)`: Shared server/client-safe helper used by upload flows to preserve contributor captions or generate fallback captions.

## UI Components

- `SiteHeader`: Server component that determines admin cookie state and renders navigation.
- `SiteHeaderClient`: Responsive header, mobile menu, admin shortcut, and search link.
- `SiteFooter`: Footer navigation and admin entry.
- `SearchBar`: Search form that routes to `/businesses?q=...`.
- `Button`: Reusable button/link styling primitive.
- `Input`: Reusable input primitive.
- `Textarea`: Reusable textarea primitive.
- `Badge`: Reusable badge primitive.
- `EmptyState`: Generic empty-state panel.
- `LoadingSkeleton`: Loading placeholder component.
- `Pagination`: Pagination controls.
- `BusinessGrid`: Directory layout and result handling.
- `BusinessCard`: Directory result card.
- `FilterPanel`: Desktop business filters.
- `MobileFilterDrawer`: Mobile filters.
- `EnquiryForm`: Business profile contact UI.
- `RecommendBusinessForm`: Recommendation submission UI.
- `BusinessListingForm`: Business onboarding form.
- `CreativeJobListingForm`: Creative job posting form.
- `ManageCreativeJobStatus`: Private status selector.
- `ManageCreativeJobDetails`: Private listing-detail editor.
- `ManageCreativeJobMedia`: Private media/caption manager.
- `FileUploader`: Shared media/reference uploader with previews and client-side image optimisation.
- `AdminPageHeader`: Admin page heading wrapper.
- `ModerationSummary`: Shared admin triage panel showing automated decision, risk, reason, and signals.
- `AdminStatusControls`: Business moderation buttons.
- `AdminCreativeJobDeleteButton`: Admin deletion confirmation for creative jobs.
- `Admin Trash Page`: Admin-only queue for rejected/dismissed/archived items waiting for seven-day cleanup.

## Design System

### Typography
- Sans-serif: Inter/system stack through `--font-sans-local`.
- Serif: Newsreader/Georgia-style editorial headings through `--font-serif-local`.
- Large editorial headings are used for landing, directory, onboarding, and profile pages.
- Compact panels use tighter sans-serif headings.

### Colours
- Background: `#fbfaf7`
- Ink/foreground: `#211f1b`
- Muted text: `#6d675d`
- Line/border: `#ded8cc`
- White surface: `#ffffff`
- Warm surface: `#f3eee5`
- Clay accent: `#9c4f35`
- Moss success: `#536343`
- Steel focus/accent: `#315c6b`
- Gold accent: `#b9852f`

### Spacing
- Main content uses `container-shell`: `min(1180px, calc(100% - 32px))`.
- Panels generally use 16-24px padding.
- Dense repeated items use smaller gaps; editorial hero sections use larger vertical spacing.

### Icons
- `lucide-react` is used for navigation, status, upload, save, search, delete, dashboard, and contact icons.

### Animations
- Motion is CSS-only and intentionally restrained.
- Platform pages use shared entrance reveals, list/card staggering, button lift, form focus feedback, details-panel opening, and footer link motion.
- Homepage elements add featured-card staggering, icon motion, and a subtle hero-card float.
- `html { scroll-behavior: smooth; }` supports feedback scrolling.
- `prefers-reduced-motion` disables motion-heavy effects.

### Responsive Behaviour
- Header collapses into mobile menu below large breakpoints.
- Directory filters support desktop panel and mobile drawer.
- Forms use single-column mobile layouts and two-column desktop groups.
- Media grids collapse naturally on smaller screens.

## Dependencies

- `next`: App framework, routing, server actions, build.
- `react`, `react-dom`: UI runtime.
- `typescript`: Type safety.
- `tailwindcss`, `@tailwindcss/postcss`: Styling.
- `@supabase/supabase-js`, `@supabase/ssr`: Supabase database/auth/storage clients.
- `zod`: Runtime validation schemas.
- `react-hook-form`, `@hookform/resolvers`: Client form handling and validation integration.
- `lucide-react`: Icon library.
- `resend`: Email delivery.
- `clsx`, `tailwind-merge`: Classname composition utilities.
- `@radix-ui/react-slot`: Composition primitive used by buttons.
- `vitest`, `jsdom`: Unit testing.
- `@playwright/test`: End-to-end testing.
- `eslint`, `eslint-config-next`: Linting.

## Coding Standards

### Naming Conventions
- React components use PascalCase.
- Server actions use verb-first camelCase names.
- Database columns use snake_case.
- TypeScript domain models convert database snake_case into camelCase public types.
- Routes use kebab-case where public-facing.

### Architecture Conventions
- Keep Supabase admin access in server-only code.
- Keep presentational components data-driven and typed.
- Use `src/lib/validation.ts` for shared Zod schemas.
- Use feature folders for multi-part workflows.
- Use server actions for mutations and `revalidatePath()` after changes.

### Styling Conventions
- Tailwind utility classes inline with components.
- Shared colours are CSS variables in `globals.css`.
- Cards/panels use square editorial borders rather than rounded-card-heavy UI.
- Avoid decorative gradients and unnecessary marketing hero layouts.

### Commenting Conventions
- Keep comments sparse.
- Comments are acceptable for accessibility/lint exceptions or non-obvious logic.

### AI Collaboration Conventions
- Follow `AI_RULES.md` before implementing changes.
- Preserve working functionality while improving maintainability and user experience.
- Update `PROJECT_CONTEXT.md`, `SESSION_HANDOVER.md`, and `CHANGELOG.md` before ending coding sessions.

## Known Issues

- Resend email delivery requires a verified sender/domain; without it, enquiry UI falls back to visible email.
- Public enquiry submission is not persisted to the `enquiries` table yet.
- Supabase Auth exists but general user account flows are incomplete.
- Some dashboard pages are scaffolds and not ready as core product experiences.
- Creative job and business private manage links are powerful: anyone with the link can edit the listing.
- Existing creative jobs and businesses created before manage-token rollout may not have manage links.
- Automated moderation currently checks text, captions, links, filenames, contact presence, and simple spam patterns; it does not inspect the visual content of uploaded images/videos.
- Smart auto-captioning is filename/context-based; it does not inspect the actual image or video content yet.
- Trash cleanup currently runs when admin pages call the cleanup helper, not on an independent schedule.

## Technical Debt

- Public business and recommendation listings no longer fall back to bundled demo records.
- Admin auth is a static credential/cookie system rather than role-based Supabase auth.
- Business materials schema remains though the current UI removed material onboarding.
- Enquiry persistence and rate limiting are not implemented.
- Public profile media and creative job media rely on public Supabase Storage URLs without transformation/CDN strategy.
- Some migrations overlap because later migrations repair earlier live setup gaps.
- Moderation triage is rule-based and should eventually be backed by provider-level text/image moderation, rate limiting, and admin audit logs.
- Trash retention should move from admin-visit-triggered cleanup to a scheduled job before higher-volume usage.
- Smart captions should eventually use actual image understanding instead of filename/context fallback.

## Future Ideas

- Email creative job and business manage links after submission.
- Add job status history and timestamps.
- Add business response tracking for creative jobs.
- Add custom domain and verified email sender.
- Add richer admin moderation queues.
- Add AI-assisted text and image moderation with configurable admin thresholds.
- Add AI-generated image/video captions and alt text for stronger accessibility.
- Add scheduled trash cleanup and optional restore.
- Add map view for businesses.
- Add AI-assisted search and service matching after enough data is collected.
- Add public trust badges based on verified recommendations.

## Outstanding Questions

- What external moderation provider should be used for actual image/video content checks?
- Should private manage links expire or be revocable?
- Should business owners eventually move from private-link editing to account-based editing?
- Should the dashboard/account area be hidden until it is fully connected?
- What custom domain and email domain will MakeSG use?
- What map provider should be used if map search becomes important?
