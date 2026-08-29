# Changelog

All notable changes to this project will be documented in this file.

The format loosely follows Keep a Changelog and semantic sections.

## [Unreleased] - 2026-08-29

### Added
- Added smart fallback captions for uncaptained business portfolio, creative job reference, and business recommendation media uploads.
- Added an admin-only trash bin at `/admin/trash` for rejected business listings, rejected business edits, rejected recommendations, dismissed change requests, and creative jobs moved to trash.
- Added restore controls in the admin trash bin so admins can return trashed items to the right review queue before deletion.
- Added seven-day trash retention cleanup that permanently deletes expired trash rows and associated Supabase Storage objects when admin trash cleanup runs.
- Added trash-retention indexes in `supabase/migrations/0015_admin_trash_retention.sql`.
- Added database-backed rotating portfolio media to the home and About pages so refreshes can show different published work.
- Added visible success/error feedback to admin creative-job editing.

### Changed
- Changed homepage, About, business onboarding, creative job posting, recommendation, management, and moderation copy to feel warmer, clearer, and less formal.
- Changed admin home into a clearer review command centre with active review queues separated from maintenance items.
- Changed admin business and creative-job queues to prioritise pending and high-risk items.
- Changed admin recommendation review to prioritise pending and high-risk submissions and show an empty state.
- Changed business moderation controls to appear before admin edit forms on business detail pages.
- Changed admin queues so rejected/dismissed/archived trash items are hidden from active review queues.
- Changed reject/dismiss admin feedback to tell admins that items move to trash for seven days.
- Changed creative job archive wording to “Move to trash” and archived status display to “In trash.”
- Changed upload helper copy so contributors know blank captions can be filled automatically.
- Changed the business directory filter from “Verified only” to “Recommended only” and wired it to approved recommendation counts.
- Changed edit, submission, recommendation, change-request, restore, and admin review feedback notices to scroll and focus after they render.

### Fixed
- Fixed blank media captions by generating simple fallback captions before records are saved.
- Fixed active admin queue clutter by moving rejected/dismissed items into a dedicated trash view.
- Fixed save confirmations that could appear above the current scroll position after editing listing details or portfolio media.
- Fixed the admin business Feature button so it now persists to Supabase and revalidates public highlight pages.
- Fixed admin creative-job saves that previously completed without visible confirmation.

### Removed
- Removed bundled demo business listings and demo recommendation listings from public and admin data flows.
- Removed outdated business verification wording from admin business queue cards.

### Known Issues
- Trash cleanup is triggered from admin dashboard/trash access, not from an independent scheduled job yet.
- Smart captions use filenames and listing context; they do not visually inspect image or video content yet.

## [Unreleased] - 2026-08-22

### Added
- Added rule-based automated moderation triage for business listings, business listing edits, creative job listings, business recommendations, and business change requests.
- Added pre-save blocking for obvious abusive, adult, spam, unsafe, or inappropriate wording in submitted text, captions, supporting links, and uploaded filenames.
- Added moderation metadata migration in `supabase/migrations/0014_moderation_triage.sql`.
- Added `pending_review` support for creative jobs, allowing low-risk jobs to auto-publish while flagged jobs wait for admin review.
- Added shared `ModerationSummary` admin UI to show automated decision, risk, reason, and signals across moderation queues.
- Added high-risk triage visibility to the admin dashboard.

### Changed
- Changed creative job submission success copy so auto-published jobs and jobs held for review show accurate feedback.
- Changed admin business, creative job, recommendation, and change-request queues to show moderation triage context.
- Changed business submission service upsert logic to use the shared Supabase helper consistently.

### Fixed
- Fixed an old nested business service helper that could conflict with shared business submission logic.
- Fixed creative job status handling so admin can see and set `pending_review`.

### Removed
- Removed no user-facing features.

### Known Issues
- Automated moderation is currently rule-based and does not inspect the actual pixels/content of uploaded images or videos.
- Full image/video safety moderation will require a third-party or AI moderation API and a privacy/cost decision.

## [Unreleased] - 2026-08-08

### Added
- Added a shared CSS-only platform motion layer for page reveals, card/list staggering, panel opening, form focus feedback, button lift states, header entrance, and footer link motion with reduced-motion support.
- Added CSS-only homepage animations for entrance reveals, featured business card staggering, hover lift states, icon motion, and a subtle hero-card float with reduced-motion support.
- Added private business listing management through `/businesses/manage/[token]`.
- Added private business listing-detail editing with automatic return to pending moderation after edits.
- Added private business portfolio media editing for photos/videos and captions.
- Added business manage tokens and portfolio media metadata migration in `supabase/migrations/0010_business_manage_links.sql`.
- Added `business_listing_revisions` migration in `supabase/migrations/0011_business_listing_revisions.sql`.
- Added private edit link display after business onboarding submission.
- Added admin review support for pending business edits while live listings remain unchanged.
- Added public business-card change requests that save into an admin dashboard queue.
- Added `business_change_requests` migration in `supabase/migrations/0013_business_change_requests.sql`.
- Added admin review controls for business listing change requests.
- Added optional phone number to business onboarding, private business editing, public profile display, and admin review.
- Added a Recommended label to business cards when a listing has approved recommendations.

### Changed
- Limited homepage directory highlights to the top six ranked businesses.
- Changed the homepage featured business section to use live published listings, ranked by recommendation count, featured status, and latest updates.
- Refreshed homepage copy and iconography to reflect current platform features: business search, moderated recommendations, creative jobs, public change requests, and private edit links.
- Changed business onboarding submission results to return a private manage token.
- Changed published business edits to save as pending revisions so the existing approved listing stays live until admin approval.
- Changed the business recommendation panel to open beneath the contact card on business profiles and added a visible close button.
- Changed duplicate-business prompts to direct people to the existing listing instead of using endorsements.
- Changed website, public email, location, minimum budget, and typical lead time to be optional in business onboarding and private business editing.
- Changed business onboarding copy to invite community submissions on behalf of businesses.
- Changed business change requests from email delivery to a persistent admin dashboard workflow.

### Fixed
- Fixed the creative job status management panel so it adapts during desktop scrolling.

### Removed
- Removed endorsement labels, counts, badges, and one-click endorsement actions from public and admin-facing pages.
- Removed the inactive Save button from public business cards.

### Known Issues
- Private business manage links are bearer credentials; anyone with the link can edit the listing.
- Existing businesses created before this migration may not have private manage links.

## [Unreleased] - 2026-07-26

### Added
- Added `AI_RULES.md` as a repository-level rulebook for future AI coding sessions.
- Added private creative job management through `/creative-jobs/manage/[token]`.
- Added private status controls for creative jobs: Open, In discussion, and Taken.
- Added private listing-detail editing for posted creative jobs.
- Added private creative job media management for photos/videos.
- Added support for editing, adding, clearing, and removing captions on creative job media.
- Added removal of existing creative job media from Supabase Storage and database records.
- Added new creative job media uploads from the private manage page.
- Added `PROJECT_CONTEXT.md` for full project documentation.
- Added `SESSION_HANDOVER.md` for session continuity.
- Added `supabase/migrations/0009_remove_closed_creative_job_status.sql`.

### Changed
- Changed creative job manage page into a full management surface for status, listing details, and media.
- Changed creative job status selector back to a compact segmented control.
- Changed save behaviour so listing-detail and media update messages scroll into view.
- Changed creative job reference mapping to include Supabase `storage_path`.
- Changed creative job status model so legacy `closed` records are converted to `taken`.
- Changed success copy after creative job creation to tell users the private link can edit listing details and status.

### Fixed
- Fixed unclear feedback after listing details were saved by scrolling to the success message.
- Fixed oversized status options caused by the status panel stretching next to a tall edit form.
- Fixed inability for creatives to manage photos/videos after a job was posted.
- Fixed duplicated status meaning between Closed and Taken.

### Removed
- Removed `Closed` from visible creative job status choices.
- Removed `closed` from fresh and repair migration creative job status constraints.

### Known Issues
- Private creative job manage links are bearer credentials; anyone with the link can edit the listing.
- Existing creative jobs created before manage-token rollout may not have private manage links.
- Public enquiries are not persisted in the `enquiries` table yet.
- Resend email delivery requires configured and verified sender credentials.
- Some dashboard/account pages remain scaffolded.
