# AI_RULES.md

## Purpose

This repository is a long-term product. Every coding session should improve the project without creating unnecessary technical debt. Prioritise maintainability, scalability and excellent user experience over quick hacks.

---

## Project Mission

Design Directory is a platform connecting creatives with businesses that can help realise ideas.

Examples include:

- Fabricators
- Woodworkers
- Metal workshops
- Electronics specialists
- 3D printing services
- Photographers
- Videographers
- Industrial designers
- Packaging suppliers
- Manufacturers
- Material suppliers
- Prototyping companies
- Freelancers

The platform should become the easiest place for a creative to answer:

> "I have an idea. Who can help me build it?"

and for businesses to answer:

> "How do I reach people looking for my services?"

Every implementation should support this mission.

---

## Core Principles

### 1. Never break existing functionality

Visual improvements should never remove working features.

Maintain backwards compatibility whenever possible.

If something must change, explain why.

### 2. Build production-quality software

Avoid temporary hacks.

Prefer robust architecture over shortcuts.

### 3. Think like a senior software engineer

Before implementing anything:

- Identify edge cases.
- Identify future scaling issues.
- Identify security implications.
- Identify performance implications.

Do not only satisfy today's requirements.

Design for future growth.

### 4. Think like a senior product designer

Every UI decision should improve:

- Clarity.
- Usability.
- Accessibility.
- Trust.
- Delight.

Avoid decoration without purpose.

Interfaces should feel calm, premium and modern.

### 5. Reuse components

Avoid duplicated code.

If similar UI appears more than once, create a reusable component.

### 6. Keep the design system consistent

Respect:

- Typography.
- Spacing.
- Colour palette.
- Grid.
- Corner radius.
- Animation timing.
- Component behaviour.

Never introduce inconsistent styles.

### 7. Mobile first

Every page must work well on:

- Phones.
- Tablets.
- Laptops.
- Desktop.

Never optimise only for desktop.

### 8. Accessibility

Aim for WCAG AA.

Check:

- Keyboard navigation.
- Focus states.
- Semantic HTML.
- Screen reader support.
- Sufficient contrast.
- Alt text.
- Labels.

### 9. Performance first

Avoid unnecessary:

- Renders.
- API requests.
- Large bundles.
- Animations.
- Images.

Optimise wherever practical.

### 10. Minimise dependencies

Before adding a package, ask:

Can this be solved with existing code?

If yes, do not install another dependency.

---

## Coding Standards

Use:

- TypeScript strict mode.
- Functional React components.
- Hooks.
- Small reusable utilities.
- Clear naming.

Avoid:

- Magic numbers.
- Deeply nested components.
- Duplicated logic.
- Global mutable state.

---

## Naming

Components:

- PascalCase.
- Example: `BusinessCard.tsx`.

Hooks:

- `useSomething`.
- Example: `useBusinesses.ts`.

Utilities:

- camelCase.
- Example: `formatBusinessType.ts`.

Constants:

- UPPER_CASE.
- Example: `DEFAULT_RADIUS`.

---

## Folder Organisation

Every new file should belong in the correct folder.

Avoid dumping files into root unless the file is repository-level documentation, configuration, or policy.

If a folder becomes crowded, reorganise it.

---

## API Design

Keep APIs:

- Predictable.
- RESTful where route handlers are used.
- Consistent.

Return proper error messages.

Validate all inputs.

Never trust user input.

---

## Database

Prefer normalised data.

Avoid duplicated information.

Use foreign keys where appropriate.

Document every schema change.

---

## Security

Never expose:

- API keys.
- Secrets.
- Private credentials.
- Tokens.

Validate:

- Uploads.
- Forms.
- Authentication.
- Authorisation.

---

## Git

Prefer:

- Small commits.
- Clear commit messages.
- One logical change per commit.

Suggested format:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `perf:`
- `style:`
- `test:`

---

## Documentation

Every coding session must update:

- `PROJECT_CONTEXT.md`
- `CHANGELOG.md`
- `SESSION_HANDOVER.md`

Documentation should always reflect the current state of the project.

---

## Before Implementing

Always think through:

1. Is there already code that solves this?
2. Will this scale?
3. Does this fit the design language?
4. Will another engineer understand this?
5. Will this be easy to maintain?

---

## Before Finishing a Session

Always:

- Update `PROJECT_CONTEXT.md`.
- Create or update `SESSION_HANDOVER.md`.
- Update `CHANGELOG.md`.
- Document new APIs.
- Document database changes.
- Document architecture changes.
- Explain important technical decisions.
- List unfinished work.
- Provide a ready-to-paste prompt for the next coding session.

---

## Preferred User Experience

The platform should feel like:

- Notion.
- Airbnb.
- Linear.
- Apple.
- Stripe.
- Calm.
- Fast.
- Minimal.
- Premium.
- Confident.

Avoid clutter.

Avoid visual noise.

Let content be the hero.

---

## Product Philosophy

When uncertain, optimise for helping a creative achieve their goal with the fewest steps possible.

Every screen should answer:

> "What do I do next?"

Every feature should reduce friction.

Every interaction should build confidence.

---

## Future Vision

This project should eventually become Singapore's best directory for creatives and makers before expanding internationally.

Architecture should support:

- Multiple countries.
- Multiple currencies.
- Localisation.
- Maps.
- Reviews.
- Messaging.
- Portfolios.
- AI-powered recommendations.
- Job postings.
- Project matching.
- Quote requests.
- Booking systems.
- Verified businesses.
- Premium subscriptions.

Avoid decisions that would make these future capabilities difficult to implement.
