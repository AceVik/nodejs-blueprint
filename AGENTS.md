Project AGENTS Guide

Purpose
- Establish a shared, evolving guide for collaborating with AI on this repository.
- Keep the focus on correctness, minimal surface change, and incremental delivery.
- This file will be extended over time; keep it concise, practical, and actionable.

Collaboration Protocol (Think → Suggest → Wait → Implement)
1) Think first
   - Identify the real objective and constraints.
   - Inspect only the minimum relevant code/files. Avoid broad, destructive edits.
   - Prefer additive changes over refactors unless explicitly requested.
   - Study nearby/related files to learn the established coding pattern and style; follow it consistently.
   - Avoid duplicate code: search for existing utilities/abstractions and reuse them.
   - Aim for clean, reusable, well-structured code; factor helpers when they are broadly useful.
2) Suggest
   - Propose one or more minimal approaches with trade‑offs.
   - Ask for clarification if requirements are ambiguous.
3) Wait for maintainer’s go
   - Do not implement significant changes before explicit approval.
   - Only proceed with the agreed approach.
4) Implement
   - Make the smallest viable change.
   - Keep changes localized. Avoid style churn and renames unless required.
   - Prefer doc comments (English) over inline comments; document public APIs, tricky logic, and assumptions.
   - Follow repository style (naming, modules, exports) and reuse existing helpers.
5) Verify
   - Run builds/tests where possible. If environment limits exist, note them.
   - Add or update minimal tests when requested.
6) Summarize
   - Provide a concise summary of what changed and why.

General Engineering Principles
- Favor explicit types and stable public contracts to avoid non‑portable inferred types (TS2742 risks).
- Keep OpenAPI & runtime behavior aligned; if you update route/interceptor metadata, ensure the generator reflects it.
- Prefer composition over inheritance unless there is a strong case. Avoid speculative abstractions.
- When introducing new concepts (e.g., interceptors), keep old code intact until migration is complete.
- Write performant, stable, and easy‑to‑read code. Prefer clear control flow and minimal allocations in hot paths.
- Strive for reuse: extract generally useful utilities into shared modules; avoid copy‑paste across packages.

Repository Practices
- Structure
  - packages/@micro/routes: Core routing, interceptors, OpenAPI integration.
  - packages/app: Application code, routes, interceptors using the core library.
  - Prefer barrel exports for DX; avoid deep import paths from app into core internals.

- TypeScript
  - Add explicit return types for exported constants/functions to prevent leaking internal type details.
  - Use `ReturnType<typeof factory>` where factories return complex generic instances that may leak internal types.
  - Keep zod schemas colocated with routes/interceptors that use them.
  - Favor doc comments (`/** ... */`) on exported types/functions/classes; avoid noisy inline comments.

- OpenAPI
  - Use the provided OpenAPI extenders/hooks from the core library where possible.
  - Register shared schemas once; avoid duplicate component IDs.
  - Ensure route security and scopes reflect attached interceptors.
  - Keep OpenAPI document generation performant by minimizing duplicate schema registrations.

- Interceptors
  - Request interceptors should:
    - perform validation/authentication/guard checks,
    - use `provide(...)` to add typed context,
    - use `resolve(...)` to read context provided by earlier interceptors,
    - expose OpenAPI metadata via the interceptor’s `openapi` hook.
  - Response interceptors should focus on post‑handler concerns (logging, transformation).

Code Style & Reuse
- Match existing naming conventions, module layout, and barrel export patterns.
- Prefer small pure functions; isolate side‑effects at boundaries (I/O, network, logging).
- Co-locate tests/examples where applicable; keep APIs minimal and orthogonal.
- Reuse existing utility functions and types; search before adding new ones.

Documentation
- Use English doc comments (`/** ... */`) for all exported entities and non‑trivial internal logic.
- Describe parameters, return types, side effects, and error cases concisely.
- Keep comments up to date with behavior; remove stale or redundant commentary.

Performance & Quality
- Avoid unnecessary object allocations and deep cloning in hot paths.
- Prefer streaming/iterative approaches over buffering large payloads when feasible.
- Guard against runtime errors with input validation and defensive programming where contracts cross boundaries.

Change Management Workflow
1) Scope the change narrowly; list target files beforehand.
2) Prefer creating new files over editing many existing ones.
3) If renaming is absolutely necessary, ensure all references are updated atomically.
4) Keep commit diffs readable; separate mechanical changes from logic changes.

Validation & Tooling
- Primary success criterion: `npm run build` succeeds (tests may be WIP during refactors).
- If tests exist and are stable, run targeted test suites for the affected area.
- When local environment tools are unavailable (e.g., missing Java), note what would be verified and how.

Communication
- Always state assumptions explicitly.
- If choosing between options, present trade‑offs and recommend one.
- Document any limitations or follow‑ups.

What to Avoid
- Broad refactors without explicit approval.
- API‑breaking changes to shared libraries unless explicitly requested.
- Removing legacy code before the migration using the new code is complete.

Templates
- Suggestion template
  - Goal:
  - Minimal options (A/B):
  - Trade‑offs:
  - Recommendation:
  - Open questions:

- Implementation summary template
  - Changed files:
  - What changed and why:
  - Verification steps:
  - Follow‑ups:

Notes for Future Extensions
- This document is intentionally general (not guard‑specific). Add sub‑sections over time for domain areas (OpenAPI generator, interceptors, middleware migration, server config) as they stabilize.

Contexts Overview (Where to find what)
- Core library (`packages/@micro/routes`)
  - `src/http/interceptors/interceptor.types.ts`
    - Interceptor context tools (`provide`, `resolve`, `onExtendRoute`) and OpenAPI extender types.
  - `src/http/interceptors/request-interceptor.class.ts`
    - Base class for request‑phase interceptors; defines the `intercept` contract and context shape.
  - `src/http/interceptors/response-interceptor.class.ts`
    - Base class for response‑phase interceptors.
  - `src/http/interceptors/interceptors.utils.ts`
    - Utilities to combine global and route‑level interceptors.
  - `src/route/*`
    - Route types/classes and how interceptors attach to routes.
  - `src/openapi/*`
    - OpenAPI registry integration, factories, and generator wiring.

- App (`packages/app`)
  - `src/interceptors/*`
    - Application‑specific interceptors (e.g., OIDC auth, role guards) built on the core.
  - `src/routes/*`
    - Routes that compose interceptors and route schemas.
  - `src/middlewares/*` (legacy)
    - Older middleware implementations retained during migration; avoid adding new code here.
