# Session Handover

Date: 2026-08-22

## Session Summary

Today's work added a first-line automated moderation triage system for MakeSG. Public submission flows now screen obvious abusive, adult, unsafe, or spam-like wording before saving. Admin queues now show a consistent automated triage summary, so business listings, business edits, creative jobs, recommendations, and change requests can be reviewed faster while the admin still keeps final override control.

## Objectives Completed

- [x] Added rule-based moderation triage utility.
- [x] Blocked obvious abusive/spam/adult/unsafe terms before saving submissions.
- [x] Checked captions, supporting text, links, filenames, contact presence, and low-detail signals.
- [x] Added moderation metadata to business listings, pending business revisions, recommendations, change requests, and creative jobs.
- [x] Added `pending_review` creative job status for flagged jobs.
- [x] Auto-published low-risk creative jobs while holding higher-risk jobs for admin review.
- [x] Kept business listings, business edits, recommendations, and change requests in admin review by default.
- [x] Added shared admin triage UI across moderation queues.
- [x] Updated project documentation and changelog.
- [x] Ran lint, TypeScript, production build, and diff checks successfully.

## Files Created

### `src/lib/moderation.ts`
Rule-based moderation helper. It returns `auto_approved`, `needs_review`, or `blocked`, plus risk level, reason, and review signals.

### `src/components/admin/moderation-summary.tsx`
Shared admin UI for displaying automated triage decision, risk, reason, and signal tags.

### `supabase/migrations/0014_moderation_triage.sql`
Adds moderation metadata columns and `pending_review` creative job status support.

## Files Modified

### `src/features/businesses/actions.ts`
Business onboarding and private business edit flows now run moderation before saving. Published edits store moderation metadata on pending revisions. Also fixed the business service helper usage.

### `src/features/creative-jobs/actions.ts`
Creative job creation and private edits now run moderation. Low-risk submissions auto-publish; flagged submissions become `pending_review`.

### `src/features/creative-jobs/creative-job-listing-form.tsx`
Success message now distinguishes between published jobs and jobs sent for admin review.

### `src/lib/creative-jobs.ts`
Creative job types and labels now include `pending_review`, plus moderation metadata mapping.

### `src/lib/business-submissions.ts`
Admin business data now includes moderation metadata for listings and pending revisions.

### `src/lib/business-recommendations.ts`
Admin recommendation data now includes moderation metadata.

### `src/lib/business-change-requests.ts`
Admin change-request data now includes moderation metadata.

### `src/components/business/recommendation-actions.ts`
Business recommendation submissions now run moderation before saving.

### `src/components/business/change-request-actions.ts`
Business change requests now run moderation before saving.

### `src/app/admin/page.tsx`
Admin home now surfaces high-risk triage counts and pending creative jobs.

### `src/app/admin/businesses/page.tsx`
Business moderation list now shows triage context.

### `src/app/admin/businesses/[id]/page.tsx`
Business detail review now shows triage context for current submissions and pending edits.

### `src/app/admin/creative-jobs/page.tsx`
Creative job admin list now shows triage context.

### `src/app/admin/creative-jobs/[id]/page.tsx`
Creative job admin detail page now shows triage context and supports `pending_review`.

### `src/app/admin/recommendations/page.tsx`
Recommendation queue now shows triage context.

### `src/app/admin/change-requests/page.tsx`
Change-request queue now shows triage context.

### `src/lib/types.ts`
Added shared moderation decision/risk/triage types.

### `PROJECT_CONTEXT.md`
Updated to describe automated moderation, new schema metadata, and current limitations.

### `CHANGELOG.md`
Added the 2026-08-22 semantic changelog entry.

## Database Changes

- Added moderation columns to:
  - `businesses`
  - `business_listing_revisions`
  - `business_recommendations`
  - `business_change_requests`
  - `creative_job_listings`
- Added `pending_review` to creative job status constraints.
- Kept `closed` in the status constraint for backward compatibility with any old rows.
- Updated public creative job policies so only `open` and `in_discussion` jobs remain public.
- Added moderation indexes for admin queue filtering.

## API Changes

- Business submission/edit actions now return a blocking message when moderation rejects obvious unsafe content.
- Creative job submission now returns the saved status so the UI can show either published or review-pending feedback.
- Recommendation and change-request actions now block obvious unsafe submissions before saving.

## UI Changes

- Admin queues now show automated triage panels with risk, decision, reason, and signal tags.
- Admin home now flags high-risk items.
- Creative job submission success copy now matches whether the job was published or sent for review.

## Bugs Fixed

- Fixed a duplicated/nested business service upsert helper that conflicted with the shared helper signature.
- Fixed creative job status handling to support `pending_review` in admin views.

## Bugs Remaining

- Uploaded image/video content is not visually inspected yet. Current moderation checks metadata, captions, text, filenames, links, and file type/size only.
- Public forms still need rate limiting.
- Admin moderation does not yet have an audit log or admin notes for every queue type.

## Technical Decisions

- Used conservative rule-based triage first to avoid adding dependencies and to keep decisions transparent.
- Auto-approval is limited to creative jobs because these are lower-risk public classifieds.
- Business listings, business edits, recommendations, and change requests still require admin review because they affect business reputation and directory trust.
- `pending_review` hides flagged creative jobs from public listing pages until admin approval.

## Lessons Learned

- Automation should reduce admin reading time without hiding admin control.
- Business reputation workflows need stricter human review than creative job classifieds.
- If image safety becomes important, metadata checks are not enough; a real moderation API will be needed.

## Risks

- Rule-based filtering can miss nuanced abuse or produce occasional false positives.
- Some blocked terms may need tuning as real users submit edge cases.
- Production Supabase must run `0014_moderation_triage.sql` before the deployed code relies on moderation columns.

## Things To Watch

- Whether many submissions become medium/high risk due to low-detail signals.
- Whether creative jobs should stay auto-published or become admin-review-first as volume grows.
- Whether business submissions need clearer wording when blocked by moderation.

## Suggested Refactoring

- Generate Supabase database types and replace manual row casts.
- Add a reusable admin queue shell with filters for risk/status/date.
- Extract shared media moderation input builders between business and creative job flows.

## Performance Considerations

- Moderation is synchronous and lightweight string matching, so it adds negligible runtime cost.
- No new dependencies were added.
- Future image moderation would add latency and cost, so it should be async or clearly communicated in UI.

## Accessibility Considerations

- Moderation summary uses semantic section labels and text, not colour alone.
- Blocked submission errors reuse existing accessible alert/error patterns.

## Security Considerations

- This is not a security boundary. It is an abuse-reduction and admin-triage layer.
- Add rate limiting to public forms before substantial public launch.
- Keep admin override protected by the existing admin login flow.

## Testing Completed

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `git diff --check`

The bundled Codex Node runtime was used because the regular shell could not find `node`.

## Testing Still Needed

- Run `supabase/migrations/0014_moderation_triage.sql` in production.
- Deploy to Vercel and smoke test:
  - Business onboarding blocks obvious unsafe text but preserves valid submissions.
  - Creative jobs auto-publish when low risk.
  - Suspicious creative jobs show as pending review in admin.
  - Admin queues show triage panels.
  - Public creative jobs do not show `pending_review`.

## Recommended Next Tasks

1. Apply the Supabase migration in production.
2. Push and redeploy on Vercel.
3. Add admin filters by moderation risk/status.
4. Add public form rate limiting.
5. Decide whether to add external image/video moderation.

## Ready-to-use Prompt for Next Session

Continue the MakeSG project in `/Users/kevinchiam/Documents/Design Directory`. Before coding, read `AI_RULES.md`, `PROJECT_CONTEXT.md`, and `SESSION_HANDOVER.md`. Today’s last work added rule-based automated moderation triage across business listings, business edits, creative jobs, business recommendations, and business change requests. Key files to read first: `src/lib/moderation.ts`, `src/components/admin/moderation-summary.tsx`, `src/features/businesses/actions.ts`, `src/features/creative-jobs/actions.ts`, `src/lib/business-submissions.ts`, `src/lib/creative-jobs.ts`, and `supabase/migrations/0014_moderation_triage.sql`. The next likely task is to apply the migration, smoke test production, and consider admin risk/status filters or real image moderation. Remember: creative jobs can auto-publish when low risk; business reputation content still requires admin review.
