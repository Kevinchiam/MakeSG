# Session Handover

Date: 2026-09-06

## Session Summary

Today’s work made MakeSG feel more forgiving and easier to maintain. Uploaded media now receives a useful fallback caption when contributors leave captions blank. The public copy was softened across key pages so the platform sounds more welcoming and less formal. Admin moderation now has a trash-bin workflow: rejected or dismissed items leave the active queues, remain visible to admins for seven days, and are then permanently cleaned up with related storage files.

Later in the session, the home and About pages were given a more visual editorial treatment using approved business portfolio media. That media now rotates from the database on each server render so refreshes can surface different published work.

Latest update: the admin dashboard and review queues were tightened so admin work is easier to understand. The dashboard now separates active review queues from maintenance, business and creative-job lists prioritise pending/high-risk items, business verification wording was removed from admin queues, the business Feature button now saves to Supabase, and admin creative-job edits now show visible success/error feedback.

Final update: home and About rotating media tiles now behave as business-profile links. Captions and labels are hidden by default and reveal only on hover or keyboard focus, keeping the imagery cleaner while preserving accessible link labels.

Current session update: low-risk new business listings and business recommendations can now auto-approve. Business listings still need a clean moderation result and a public contact route before they go live automatically. Medium-risk, high-risk, duplicate, blocked, no-contact, and edited listings still require admin review. Admin dashboard now shows an automation summary, and auto-approved records remain visible in admin queues for override.

Newest update: public business change requests now support optional photos/videos and captions. Admins review each request beside the live business listing editor and media editor, so useful corrections can be applied immediately while keeping admin override intact.

Restore fix: dismissed business change requests now restore to `open`, which matches the database status constraint. The previous restore target was `pending`, which Supabase rejected for `business_change_requests`.

Caption polish: home and About media captions now use one shared streaming caption component. Long captions from present and future directory media stream across the visible caption window on hover or keyboard focus instead of being cropped.

Admin recommendation editing: admins can now review and correct recommendation submissions from `/admin/recommendations`. The new collapsible edit form supports ratings, review text, recommender details, name display permission, supporting links, media caption edits, media removal, and new recommendation media uploads.

Business onboarding guidance: the `/for-businesses` form now mirrors the creative job form's live character guidance. Business name, short summary, and full description tell submitters the minimum length and update as they type.

Media caption placement: caption inputs for new uploads now appear directly inside each uploaded file preview card. This applies across business onboarding, private business media editing, creative job posting, private creative job media editing, recommendations, business change requests, and admin media edit forms.

AI captioning update: blank image captions now use the OpenAI Responses API when `OPENAI_API_KEY` is configured. User-written captions are preserved, videos keep the simple fallback caption, and failed/slow AI calls quietly fall back to the existing filename/context caption so uploads still complete. Clearing an existing image caption during edit now also regenerates from the saved image URL.

Profile image copy update: business media upload copy now tells submitters that the first approved photo becomes the business profile image on cards and the listing page, while the remaining media appears in the portfolio.

Private link reminder update: business listing success feedback now has a clear “Save your private edit link” section with a copy button and warns that anyone with the link can edit the listing.

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
- [x] Made home and About media tiles clickable and changed captions to hover/focus reveal only.
- [x] Added low-risk auto-approval for new business listings and business recommendations.
- [x] Kept admin override by labelling auto-approved records in admin queues and summarising automation on admin home.
- [x] Added moderation unit tests for auto-approval, review fallback, and blocked content.
- [x] Reworked admin home into active review queues plus maintenance.
- [x] Prioritised pending and high-risk items in admin business and creative-job queues.
- [x] Removed outdated verification wording from admin business list cards.
- [x] Fixed the admin business Feature button so it persists to Supabase.
- [x] Added visible save/error feedback to admin creative-job editing.
- [x] Added media uploads and captions to public business change requests.
- [x] Added side-by-side admin review for change requests and live business editing.
- [x] Added storage cleanup for expired dismissed change-request media.
- [x] Fixed trash restore for dismissed business change requests.
- [x] Made landing and About page media captions stream consistently across all database-backed image/video tiles.
- [x] Added admin editing for business recommendations, including attached recommendation media.
- [x] Added live minimum-character guidance to business onboarding required text fields.
- [x] Moved caption inputs below their related uploaded image/video previews across MakeSG media upload fields.
- [x] Added optional AI image captions for blank uploaded image captions across public, private, and admin upload flows.
- [x] Fixed existing media edits so cleared image captions can regenerate with AI instead of only using simple fallbacks.
- [x] Clarified business media upload copy so people know where the profile image appears.
- [x] Added a stronger reminder and copy action for saving the business private edit link after listing submission.
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

### `supabase/migrations/0016_business_change_request_media.sql`
Adds the `business_change_request_media` table for photos/videos attached to public listing correction requests. Rows reference `business_change_requests`, store Supabase Storage metadata, and are admin-managed through RLS.

### `src/components/site/streaming-media-caption.tsx`
Shared caption component for homepage and About page media overlays. It duplicates the visible caption text inside a masked track so long captions can stream smoothly without resizing or clipping the media tile.

### `src/components/admin/admin-recommendation-edit-form.tsx`
Collapsible admin editor for recommendation submissions. It mirrors the public recommendation fields, lets admins correct captions/remove uploads/add replacement media, and shows inline save feedback that scrolls into view.

### `src/components/projects/file-uploader.tsx`
Shared media uploader now supports optional per-file fields rendered inside each preview card, allowing captions and future upload metadata to sit beside the exact file they describe.

### `src/lib/ai-media-captions.ts`
Server-only helper that preserves user-written captions, asks OpenAI to describe blank image captions after upload, skips videos, uses a short timeout, and falls back to the existing simple caption helper if AI is not configured or unavailable.

### `tests/unit/ai-media-captions.test.ts`
Unit coverage for preserving written captions, generating an AI caption for blank image uploads, falling back when the API fails, and skipping video uploads.

## Files Modified

### `src/features/businesses/actions.ts`
Business portfolio uploads now use AI image captions when captions are blank and OpenAI is configured. Private business media edits also apply AI captions for blank new image uploads and simple fallback captions for cleared captions/videos.

### `src/features/creative-jobs/actions.ts`
Creative job reference uploads and private media edits now use AI image captions for blank images when configured, with simple fallbacks based on the job title.

### `src/components/business/recommendation-actions.ts`
Recommendation media uploads now use AI image captions when contributors do not provide image captions, with simple fallback captions when AI is unavailable.

### `src/features/businesses/business-listing-form.tsx`
Business onboarding copy is warmer and clearer. Upload copy explains that blank captions are acceptable. Success and duplicate-listing messages now read less formally. Required text fields now show live minimum-character guidance for business name, short summary, and full description. New portfolio captions now appear below each uploaded preview.

### `src/features/businesses/manage-business-details.tsx`
Private business edit success copy now says changes are waiting for review again.

### `src/features/businesses/manage-business-media.tsx`
Private business media editing now tells users blank captions can be filled automatically, uses friendlier review copy, and places new-upload caption fields below their matching previews.

### `src/features/creative-jobs/creative-job-listing-form.tsx`
Creative job posting copy is friendlier. Reference upload copy mentions automatic simple captions when blank, and new reference captions now appear below each uploaded preview.

### `src/features/creative-jobs/manage-creative-job-media.tsx`
Private creative job media editing now places new-upload caption fields below their matching previews.

### `src/components/business/recommend-business-panel.tsx`
Recommendation panel copy now uses “review” language instead of “moderation” and explains optional media captions more gently. Recommendation upload captions now sit below their related file previews.

### `src/app/page.tsx`
Homepage copy now reflects MakeSG as a practical community platform for finding businesses, posting jobs, requesting changes, and sharing recommendations. The hero now uses a richer media-led visual panel, and the selected photos/videos shuffle from published business media on refresh. Media overlay captions now use the shared streaming caption component.

### `src/app/about/page.tsx`
About page copy no longer describes the product as fictional and now explains the platform in simpler, friendlier language. It also uses rotating published business media so the page feels less static. Media overlay captions now use the shared streaming caption component.

### `src/app/globals.css`
Media-caption CSS now gives caption text a stable clipped viewport and moves a duplicated caption track inside it on hover/focus. This prevents long captions from being cut off on narrow homepage and About media tiles while preserving reduced-motion behaviour.

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
Recommendation review now sorts pending/high-risk submissions first, includes a clear empty state, and provides an edit form for each active recommendation.

### `src/app/admin/businesses/[id]/page.tsx`
Business moderation controls now appear before manual edit forms, keeping approve/reject/feature decisions easier to find.

### `src/components/admin/admin-creative-job-edit-form.tsx`
New admin creative-job edit form that preserves the previous editing fields while adding success/error feedback after saves.

### `src/lib/business-submissions.ts`
Active admin business queues now exclude rejected listings and expose featured state and timestamps for better admin sorting and labels.

### `src/lib/business-recommendations.ts`
Active admin recommendation queues now exclude rejected recommendations and load recommendation media metadata needed for admin editing.

### `src/lib/business-change-requests.ts`
Active admin change-request queues now exclude dismissed requests and load supporting media URLs for admin review.

### `src/components/business/change-request-actions.ts`
Public business change requests now accept optional photos/videos, validate file type and a 10MB combined upload limit, upload files to Supabase Storage, attach captions, and roll back saved data if upload fails.

### `src/components/business/request-business-change-panel.tsx`
The public Request a change panel now includes an optional media uploader and per-file captions while preserving inline validation feedback. Caption inputs now sit below the uploaded file they describe.

### `src/app/admin/change-requests/page.tsx`
The admin change-request page now presents the request, requester notes, supporting media, moderation summary, and admin controls beside the live business listing and media editing forms.

### `src/components/admin/admin-business-media-form.tsx`
Admin business media editing now places captions for new uploads below their matching previews.

### `src/lib/admin-trash.ts`
Expired dismissed change requests now remove their supporting media from `business-portfolios` during trash cleanup.

### `src/lib/creative-jobs.ts`
Active admin creative job queues now exclude archived jobs; archived status label changed to “In trash.”

### `src/components/admin/admin-status-controls.tsx`
Reject feedback now tells admins that rejected items move to the trash bin for seven days. Business feature/unfeature controls now persist to Supabase instead of only changing local screen text.

### `src/components/admin/business-change-request-controls.tsx`
Dismiss feedback now tells admins that dismissed requests move to the trash bin for seven days.

### `src/components/admin/actions.ts`
Admin actions now revalidate `/admin/trash` when moderation, deletion, change-request status, or trash restore changes. Business feature/unfeature now revalidates public highlights and directory pages. Dismissed business change requests restore to `open`, not `pending`, because the database only allows `open`, `reviewed`, and `dismissed` for that table. Recommendation edits now save ratings, review text, contributor details, supporting links, and media changes while revalidating the affected public business profile. Admin-added blank image captions now use AI when configured.

### `src/app/admin/creative-jobs/[id]/page.tsx`
Admin creative job archived action is now labelled “Move to trash,” and the edit form now shows visible save/error feedback.

### `PROJECT_CONTEXT.md`
Updated to document smart captions, admin trash, trash cleanup limits, revised copy direction, schema implications, and future scheduled cleanup work.

### `CHANGELOG.md`
Added the 2026-08-29 changelog entry.

## Database Changes

- Added `supabase/migrations/0015_admin_trash_retention.sql`.
- Added `supabase/migrations/0016_business_change_request_media.sql`.
- The migration only adds indexes; it does not delete data or change existing table shapes.
- The new change-request media migration adds a linked media table and does not alter existing change-request rows.
- Existing statuses are used as trash states:
  - `businesses.publication_status = 'rejected'`
  - `business_listing_revisions.status = 'rejected'`
  - `business_recommendations.status = 'rejected'`
  - `business_change_requests.status = 'dismissed'`
- `creative_job_listings.status = 'archived'`
- Apply this migration in Supabase before relying on the production trash cleanup performance.
- Apply `0016_business_change_request_media.sql` in Supabase before using media uploads on public change requests in production.

## API Changes

- Upload-related server actions now call `smartMediaCaption()` before inserting media rows.
- New image upload flows now call `captionUploadedMedia()` after storage upload so blank image captions can use OpenAI vision from the public media URL before the media row is saved.
- Admin business feature/unfeature now persists to Supabase and revalidates public pages that use featured listings.
- `getAdminTrashItems({ purgeExpired })` provides admin trash listing and cleanup.
- `restoreTrashItem(kind, id)` restores trash items to the appropriate review queue.
- Admin dashboard and trash page trigger expired-trash cleanup.
- Active admin queue helpers filter out trash-state rows.
- `requestBusinessChange(formData)` now accepts `changeRequestMedia` files and `changeRequestMediaCaptions`, validates type/size, uploads to Supabase Storage, and saves linked media rows.
- Admin change-request loading now includes public URLs for attached media.

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
- Public change requests now allow photos/videos and captions.
- Admin change requests now use a two-column review workspace: request evidence on one side, live listing/media editing on the other.

## Bugs Fixed

- Blank media captions no longer result in empty or unhelpful captions.
- Rejected/dismissed items no longer stay mixed into active admin queues.
- Admin reject/dismiss feedback now explains where items went.
- Admins can now restore trash items before the seven-day cleanup window ends.
- Admin business Feature no longer creates a false local-only status.
- Admin creative-job saves no longer complete silently with no confirmation.
- Failed change-request media uploads now roll back the request and clean up any files uploaded earlier in the same submission.
- Dismissed change requests can now be restored from trash without violating the database status constraint.

## Bugs Remaining

- Trash cleanup is not independently scheduled yet; it runs when admin pages call the cleanup helper.
- AI captions inspect images only when OpenAI is configured and the contributor/admin leaves the caption blank.
- Public forms still need rate limiting.
- Visual image/video moderation is still rule-based metadata checking only.
- Change-request media requires the `0016_business_change_request_media.sql` migration in production before uploads can save.

## Technical Decisions

- Kept filename/context fallback captions as the safety net because AI captioning should never block uploads.
- Used direct `fetch` calls to OpenAI instead of adding a dependency, keeping the feature small and server-only.
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
- Public change-request media uses the public `business-portfolios` bucket so admins can preview it easily.
- Treating existing statuses as trash states means “archived” creative jobs now function as trash, not long-term archive.
- Private manage links remain bearer credentials.

## Things To Watch

- Whether restored items should remember their exact previous status instead of returning to review queues.
- Whether seven days is enough retention before permanent deletion.
- Whether AI captions should be generated in the background if upload volume grows or if response time becomes noticeable.
- Whether rejected business listings should be hidden from every future reporting/export surface.
- Whether change requests should eventually support structured suggested fields, not just free-text reasons and supporting media.

## Suggested Refactoring

- Move trash cleanup into a scheduled Vercel Cron route or Supabase scheduled function.
- Add an `admin_events` audit table for moderation decisions, trash moves, restores, and purges.
- Add queue filters/search and bulk actions once admin volume grows.
- Generate typed Supabase schemas to reduce casts in admin helpers.
- Extract a shared media-upload mapping utility for business, recommendation, and creative job flows.
- Consider extracting repeated admin business-edit sections into a reusable side-by-side review layout if more queues need live editing.

## Performance Considerations

- AI image captioning adds one short external API call per blank image caption. Written captions and videos skip AI, and failed/slow calls fall back after a short timeout.
- Trash indexes should keep admin cleanup queries cheap as data grows.
- Storage deletion happens during cleanup and could become slow if many expired items accumulate; schedule/background execution would be better at scale.
- Change-request media adds storage work to public submissions; client-side optimisation from `FileUploader` keeps image uploads smaller where possible.

## Accessibility Considerations

- AI image captions improve media descriptions for uncaptained images, but they are still concise captions rather than full accessibility alt text.
- New trash page uses semantic headings, list content, links, and existing focusable controls.
- Copy changes should reduce cognitive load for first-time contributors.
- Change-request media previews use image alt text from captions or filenames; richer visual alt text would require real image understanding.

## Security Considerations

- Admin trash is protected by the existing admin middleware.
- Public users cannot access `/admin/trash` without the admin cookie.
- `OPENAI_API_KEY` is server-only and must stay out of browser-exposed `NEXT_PUBLIC_` variables.
- Permanent deletion should remain admin-only or scheduled server-side.
- Change-request media is protected by admin-only RLS at the database row level, while files are stored in the existing public portfolio bucket for preview simplicity.

## Testing Completed

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- `git diff --check`

The bundled Codex Node runtime was used because the regular shell could not find `node`.

## Testing Still Needed

- Apply `supabase/migrations/0015_admin_trash_retention.sql` in production Supabase.
- Apply `supabase/migrations/0016_business_change_request_media.sql` in production Supabase.
- Deploy to Vercel.
- Smoke test:
  - Business onboarding with blank image captions.
  - Creative job posting with blank image captions.
  - Business recommendation with blank image captions.
  - Public business change request with one or more media uploads and captions.
  - Admin change-request review page with request media beside the live business editor.
  - Reject a business and confirm it appears in `/admin/trash`.
  - Dismiss a change request and confirm it appears in `/admin/trash`.
  - Confirm active admin queues no longer show trash items.
- After seven days or with a test old row, confirm expired trash cleanup removes database rows and storage files.

## Recommended Next Tasks

1. Apply the new Supabase migrations and redeploy.
2. Add a scheduled cleanup route using Vercel Cron so trash purges without needing an admin visit.
3. Add actual image/video moderation after choosing a provider and privacy threshold.
4. Add public form rate limiting.
5. Add admin audit logs for every moderation decision.

## Ready-to-use Prompt for Next Session

Continue the MakeSG project in `/Users/kevinchiam/Documents/Design Directory`. Before coding, read `AI_RULES.md`, `PROJECT_CONTEXT.md`, and `SESSION_HANDOVER.md`. The latest work on 2026-09-06 added low-risk auto-approval, media-backed public business change requests, shared per-upload caption placement, and optional OpenAI image captions for blank uploaded image captions. Key files to read first: `src/lib/ai-media-captions.ts`, `src/lib/media-captions.ts`, `src/features/businesses/actions.ts`, `src/features/creative-jobs/actions.ts`, `src/components/business/recommendation-actions.ts`, `src/components/business/change-request-actions.ts`, `src/components/admin/actions.ts`, `src/components/projects/file-uploader.tsx`, `src/lib/moderation.ts`, `supabase/migrations/0015_admin_trash_retention.sql`, and `supabase/migrations/0016_business_change_request_media.sql`. The next likely task is to smoke test blank-caption image uploads on Vercel now that `OPENAI_API_KEY` is configured, then move trash cleanup to a scheduled Vercel Cron route. Remember the current decisions: user-written captions are preserved; AI captions are image-only and fall back to filename/context captions; videos still use simple fallback captions; rejected business/recommendation/revision rows, dismissed change requests, and archived creative jobs are considered trash; change-request media is shown only to admin review; public change requests stay free-text plus optional media for now; admin override stays central.
