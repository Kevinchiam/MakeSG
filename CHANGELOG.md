# Changelog

All notable changes to this project will be documented in this file.

The format loosely follows Keep a Changelog and semantic sections.

## [Unreleased] - 2026-08-08

### Added
- Added private business listing management through `/businesses/manage/[token]`.
- Added private business listing-detail editing with automatic return to pending moderation after edits.
- Added private business portfolio media editing for photos/videos and captions.
- Added business manage tokens and portfolio media metadata migration in `supabase/migrations/0010_business_manage_links.sql`.
- Added `business_listing_revisions` migration in `supabase/migrations/0011_business_listing_revisions.sql`.
- Added private edit link display after business onboarding submission.
- Added admin review support for pending business edits while live listings remain unchanged.

### Changed
- Changed business onboarding submission results to return a private manage token.
- Changed published business edits to save as pending revisions so the existing approved listing stays live until admin approval.

### Fixed
- Fixed the creative job status management panel so it adapts during desktop scrolling.

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
