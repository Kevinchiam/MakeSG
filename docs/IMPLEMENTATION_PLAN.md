# MakeSG Implementation Plan

## Concise Plan
1. Phase 1: initialise Next.js, design system, mock-data-backed public routes, reusable components and URL-synchronised provider search.
2. Phase 2: add Supabase schema, RLS policies, storage buckets, auth-ready clients and environment handling.
3. Phase 3: build project submission, transparent service recommendations, provider onboarding, enquiries and save interactions.
4. Phase 4: add admin moderation, SEO, analytics/email abstractions, tests and deployment documentation.

## Proposed Folder Structure
- `src/app`: App Router pages, metadata, sitemap, robots, error and loading states.
- `src/components`: reusable UI, site shell, business, project and admin components.
- `src/features`: feature-level forms and future repository boundaries.
- `src/lib`: data, types, validation, Supabase, recommendation logic, analytics, email and permission helpers.
- `supabase/migrations`: SQL schema, storage and RLS.
- `supabase/seed`: demo seed data.
- `tests/unit` and `tests/e2e`: Vitest and Playwright coverage.

## Database Relationship Summary
Profiles belong to Supabase auth users. Businesses optionally belong to providers and connect to services/materials through join tables. Portfolio items belong to businesses. Projects belong to creatives, project files belong to projects, project service matches store recommendation outputs, enquiries connect a sender, project and business, saved businesses connect users to businesses, business recommendations connect first-hand recommenders to businesses for moderation, and reports can reference business or portfolio content.

## Key Assumptions
- Demo listings are fictional and use generated geometric placeholders.
- Providers submit listings for admin moderation; only admins can publish, feature, reject or suspend.
- Authentication UI is magic-link and Google OAuth-ready, with Supabase clients scaffolded but not requiring credentials for local mock-data browsing.
- Recommendations are intentionally rules-based and explainable, not AI-generated.
- Word-of-mouth business recommendations are moderated trust signals, not public star ratings or open reviews.
- Recommendation and provider-onboarding media supports photos and short videos so users can inspect tangible work examples before enquiring.
