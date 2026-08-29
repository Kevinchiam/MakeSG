# Session Handover

Date: 2026-08-29

## Session Summary

Today’s work made MakeSG feel more forgiving and easier to maintain. Uploaded media now receives a useful fallback caption when contributors leave captions blank. The public copy was softened across key pages so the platform sounds more welcoming and less formal. Admin moderation now has a trash-bin workflow: rejected or dismissed items leave the active queues, remain visible to admins for seven days, and are then permanently cleaned up with related storage files.

Later in the session, the home and About pages were given a more visual editorial treatment using approved business portfolio media. That media now rotates from the database on each server render so refreshes can surface different published work.

Latest update: the admin dashboard and review queues were tightened so admin work is easier to understand. The dashboard now separates active review queues from maintenance, business and creative-job lists prioritise pending/high-risk items, business verification wording was removed from admin queues, the business Feature button now saves to Supabase, and admin creative-job edits now show visible success/error feedback.

## Objectives Completed

- [x] Added smart fallback captions for uncaptained uploads.
- [x] Applied fallback captions across business onboarding, private business media edits, creative job references, private creative job media edits, and business recommendation media.
- [x] Rewrote major public and workflow copy to be friendlier and easier to understand.
- [x] Added an admin-only trash bin at `/admin/trash`.
- [x] Added restore controls so admins can undo accidental trash moves before cleanup.
- [x] Moved rejected/dismissed/archived admin items out of active queues.
- [x] Added seven-day trash retention cleanup for database rows and related storage files.
- [x] Added Supabase migration indexes to support trash cleanup queries.
- [x] Added rotating live portfolio media to the home and About pages.
- [x] Reworked admin home into active review queues plus maintenance.
- [x] Prioritised pending and high-risk items in admin business and creative-job queues.
- [x] Removed outdated verification wording from admin business list cards.
- [x] Fixed the admin business Feature button so it persists to Supabase.
- [x] Added visible save/error feedback to admin creative-job editing.
- [x] Updated `PROJECT_CONTEXT.md`, `SESSION_HANDOVER.md`, and `CHANGELOG.md`.
- [x] Ran lint, TypeScript checks, production build, unit tests, and diff checks successfully.

## Files Created

### `src/lib/media-captions.ts`
Shared helper that preserves contributor-written captions and generates simple fallback captions when captions are blank. It uses filename cleanup and contextual fallback text, while avoiding generic filenames like screenshots or camera defaults.

### `src/lib/admin-trash.ts`
Admin-only trash aggregation and cleanup helper. It lists rejected/dismissed/archived items, computes retention dates, purges expired rows, and removes related files from Supabase Storage where possible.

### `src/app/admin/trash/page.tsx`
Admin-only trash-bin page showing trashed item type, title, reason/status, moved date, delete-after date, restore controls, and detail links.

### `src/components/admin/restore-trash-item-button.tsx`
Client-side restore button for trash items. It calls the shared admin restore action and shows inline feedback.

### `supabase/migrations/0015_admin_trash_retention.sql`
Adds partial indexes for faster cleanup/filtering of rejected businesses, rejected business revisions, rejected recommendations, archived creative jobs, and dismissed business change requests.

## Files Modified

### `src/features/businesses/actions.ts`
Business portfolio uploads now use smart fallback captions. Private business media edits also apply fallback captions for new uploads and cleared captions.

### `src/features/creative-jobs/actions.ts`
Creative job reference uploads and private media edits now use smart fallback captions based on the job title.

### `src/components/business/recommendation-actions.ts`
Recommendation media uploads now use smart fallback captions when contributors do not provide captions.

### `src/features/businesses/business-listing-form.tsx`
Business onboarding copy is warmer and clearer. Upload copy explains that blank captions are acceptable. Success and duplicate-listing messages now read less formally.

### `src/features/businesses/manage-business-details.tsx`
Private business edit success copy now says changes are waiting for review again.

### `src/features/businesses/manage-business-media.tsx`
Private business media editing now tells users blank captions can be filled automatically and uses friendlier review copy.

### `src/features/creative-jobs/creative-job-listing-form.tsx`
Creative job posting copy is friendlier. Reference upload copy mentions automatic simple captions when blank.

### `src/components/business/recommend-business-panel.tsx`
Recommendation panel copy now uses “review” language instead of “moderation” and explains optional media captions more gently.

### `src/app/page.tsx`
Homepage copy now reflects MakeSG as a practical community platform for finding businesses, posting jobs, requesting changes, and sharing recommendations. The hero now uses a richer media-led visual panel, and the selected photos/videos shuffle from published business media on refresh.

### `src/app/about/page.tsx`
About page copy no longer describes the product as fictional and now explains the platform in simpler, friendlier language. It also uses rotating published business media so the page feels less static.

### `src/app/for-businesses/page.tsx`
Business submission page now invites both business owners and community members to share useful businesses.

### `src/app/for-creatives/page.tsx`
Creative job page now sounds more conversational and focuses on posting work for businesses to find.

### `src/app/businesses/manage/[token]/page.tsx`
Private business management page copy now uses clearer “private business link” and “review status” wording.

### `src/app/creative-jobs/manage/[token]/page.tsx`
Private creative job management page copy now uses clearer “private job link” wording.

### `src/lib/moderation.ts`
Moderation reasons and blocking messages now sound less severe while still clearly guiding users to fix unsuitable wording or filenames.

### `src/lib/validation.ts`
Validation helper text now uses “businesses” consistently and says “review” instead of “moderation” where user-facing.

### `src/components/business/recommend-business-lookup.tsx`
Recommendation lookup copy now says listings are sent for review.

### `src/app/admin/page.tsx`
Admin home now includes trash-bin count, calls trash cleanup so expired items can be purged, and is organised into active review queues plus maintenance items.

### `src/app/admin/businesses/page.tsx`
Business review queue now prioritises pending edits, pending listings, and high-risk items. It uses plain labels such as Pending edits, Pending review, Published, and Unpublished, and no longer shows the unused verification label.

### `src/app/admin/creative-jobs/page.tsx`
Creative job review queue now prioritises pending/high-risk jobs, shows clearer queue summary badges, and uses “creatives” instead of “clients.”

### `src/app/admin/recommendations/page.tsx`
Recommendation review now sorts pending/high-risk submissions first and includes a clear empty state.

### `src/app/admin/businesses/[id]/page.tsx`
Business moderation controls now appear before manual edit forms, keeping approve/reject/feature decisions easier to find.

### `src/components/admin/admin-creative-job-edit-form.tsx`
New admin creative-job edit form that preserves the previous editing fields while adding success/error feedback after saves.

### `src/lib/business-submissions.ts`
Active admin business queues now exclude rejected listings and expose featured state and timestamps for better admin sorting and labels.

### `src/lib/business-recommendations.ts`
Active admin recommendation queues now exclude rejected recommendations.

### `src/lib/business-change-requests.ts`
Active admin change-request queues now exclude dismissed requests.

### `src/lib/creative-jobs.ts`
Active admin creative job queues now exclude archived jobs; archived status label changed to “In trash.”

### `src/components/admin/admin-status-controls.tsx`
Reject feedback now tells admins that rejected items move to the trash bin for seven days. Business feature/unfeature controls now persist to Supabase instead of only changing local screen text.

### `src/components/admin/business-change-request-controls.tsx`
Dismiss feedback now tells admins that dismissed requests move to the trash bin for seven days.

### `src/components/admin/actions.ts`
Admin actions now revalidate `/admin/trash` when moderation, deletion, change-request status, or trash restore changes. Business feature/unfeature now revalidates public highlights and directory pages.

### `src/app/admin/creative-jobs/[id]/page.tsx`
Admin creative job archived action is now labelled “Move to trash,” and the edit form now shows visible save/error feedback.

### `PROJECT_CONTEXT.md`
Updated to document smart captions, admin trash, trash cleanup limits, revised copy direction, schema implications, and future scheduled cleanup work.

### `CHANGELOG.md`
Added the 2026-08-29 changelog entry.

## Database Changes

- Added `supabase/migrations/0015_admin_trash_retention.sql`.
- The migration only adds indexes; it does not delete data or change existing table shapes.
- Existing statuses are used as trash states:
  - `businesses.publication_status = 'rejected'`
  - `business_listing_revisions.status = 'rejected'`
  - `business_recommendations.status = 'rejected'`
  - `business_change_requests.status = 'dismissed'`
  - `creative_job_listings.status = 'archived'`
- Apply this migration in Supabase before relying on the production trash cleanup performance.

## API Changes

- Upload-related server actions now call `smartMediaCaption()` before inserting media rows.
- Admin business feature/unfeature now persists to Supabase and revalidates public pages that use featured listings.
- `getAdminTrashItems({ purgeExpired })` provides admin trash listing and cleanup.
- `restoreTrashItem(kind, id)` restores trash items to the appropriate review queue.
- Admin dashboard and trash page trigger expired-trash cleanup.
- Active admin queue helpers filter out trash-state rows.

## UI Changes

- Added `/admin/trash` as a new admin page.
- Added restore buttons to `/admin/trash`.
- Added a Trash bin card on admin home.
- Added rotating database-backed portfolio media to the home and About pages.
- Reworked admin home around active review work, high-risk triage, and maintenance.
- Improved business, creative-job, and recommendation queue sorting and empty states.
- Added visible save feedback to admin creative-job editing.
- Rejected/dismissed items no longer clutter normal review queues.
- Upload helper text now reassures users that blank captions are fine.
- Major public-facing copy was softened across home, About, business submission, creative job posting, recommendation, and private management pages.

## Bugs Fixed

- Blank media captions no longer result in empty or unhelpful captions.
- Rejected/dismissed items no longer stay mixed into active admin queues.
- Admin reject/dismiss feedback now explains where items went.
- Admins can now restore trash items before the seven-day cleanup window ends.
- Admin business Feature no longer creates a false local-only status.
- Admin creative-job saves no longer complete silently with no confirmation.

## Bugs Remaining

- Trash cleanup is not independently scheduled yet; it runs when admin pages call the cleanup helper.
- Smart captions do not inspect actual image/video content.
- Public forms still need rate limiting.
- Visual image/video moderation is still rule-based metadata checking only.

## Technical Decisions

- Used filename/context fallback captions first because it is reliable, private, fast, and dependency-free.
- Used existing status fields as trash states instead of adding new trash tables, reducing schema churn.
- Performed storage cleanup before deleting expired rows so orphaned media is less likely.
- Kept admin override intact: trash is a retention layer, not a replacement for admin decision-making.
- Persisted Feature as a true boolean setting because homepage highlights already use the `featured` column.

## Lessons Learned

- Friendly copy matters because contributors may not understand platform language like “moderation.”
- Rejected content should leave review queues quickly so admins can focus on open decisions.
- A simple caption fallback improves polish, but true auto-captioning will need image understanding later.

## Risks

- If admin pages are not visited, expired trash will not be purged automatically.
- Storage cleanup may miss files if older rows have missing or malformed storage paths.
- Treating existing statuses as trash states means “archived” creative jobs now function as trash, not long-term archive.
- Private manage links remain bearer credentials.

## Things To Watch

- Whether restored items should remember their exact previous status instead of returning to review queues.
- Whether seven days is enough retention before permanent deletion.
- Whether users expect actual AI captions from image contents rather than filename-based captions.
- Whether rejected business listings should be hidden from every future reporting/export surface.

## Suggested Refactoring

- Move trash cleanup into a scheduled Vercel Cron route or Supabase scheduled function.
- Add an `admin_events` audit table for moderation decisions, trash moves, restores, and purges.
- Add queue filters/search and bulk actions once admin volume grows.
- Generate typed Supabase schemas to reduce casts in admin helpers.
- Extract a shared media-upload mapping utility for business, recommendation, and creative job flows.

## Performance Considerations

- Smart captioning is simple string processing and adds negligible overhead.
- Trash indexes should keep admin cleanup queries cheap as data grows.
- Storage deletion happens during cleanup and could become slow if many expired items accumulate; schedule/background execution would be better at scale.

## Accessibility Considerations

- Fallback captions improve media descriptions, but they are not yet true alt text generated from visual content.
- New trash page uses semantic headings, list content, links, and existing focusable controls.
- Copy changes should reduce cognitive load for first-time contributors.

## Security Considerations

- Admin trash is protected by the existing admin middleware.
- Public users cannot access `/admin/trash` without the admin cookie.
- No secrets were added.
- Permanent deletion should remain admin-only or scheduled server-side.

## Testing Completed

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `git diff --check`

The bundled Codex Node runtime was used because the regular shell could not find `node`.

## Testing Still Needed

- Apply `supabase/migrations/0015_admin_trash_retention.sql` in production Supabase.
- Deploy to Vercel.
- Smoke test:
  - Business onboarding with blank media captions.
  - Creative job posting with blank reference captions.
  - Business recommendation with blank media captions.
  - Reject a business and confirm it appears in `/admin/trash`.
  - Dismiss a change request and confirm it appears in `/admin/trash`.
  - Confirm active admin queues no longer show trash items.
- After seven days or with a test old row, confirm expired trash cleanup removes database rows and storage files.

## Recommended Next Tasks

1. Apply the new Supabase migration and redeploy.
2. Add a scheduled cleanup route using Vercel Cron so trash purges without needing an admin visit.
3. Add actual image/video moderation and AI captions after choosing a provider.
4. Add public form rate limiting.
5. Add admin audit logs for every moderation decision.

## Ready-to-use Prompt for Next Session

Continue the MakeSG project in `/Users/kevinchiam/Documents/Design Directory`. Before coding, read `AI_RULES.md`, `PROJECT_CONTEXT.md`, and `SESSION_HANDOVER.md`. The latest work on 2026-08-29 added smart fallback captions for uncaptained media, friendlier site copy, an admin-only trash bin with seven-day retention cleanup, and restore controls for trash items. Key files to read first: `src/lib/media-captions.ts`, `src/lib/admin-trash.ts`, `src/app/admin/trash/page.tsx`, `src/components/admin/restore-trash-item-button.tsx`, `src/components/admin/actions.ts`, `src/app/admin/page.tsx`, `src/features/businesses/actions.ts`, `src/features/creative-jobs/actions.ts`, `src/components/business/recommendation-actions.ts`, and `supabase/migrations/0015_admin_trash_retention.sql`. The next likely task is to apply the migration, deploy, and then move trash cleanup to a scheduled Vercel Cron route. Remember the current decision: smart captions are filename/context-based, not visual AI; rejected business/recommendation/revision rows, dismissed change requests, and archived creative jobs are considered trash; restored trash items return to review queues rather than going straight public; admin override stays central.
