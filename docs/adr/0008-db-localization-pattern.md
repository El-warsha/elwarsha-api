# ADR 0008 — Database and API localization pattern

## Decision

Multi-language support follows a tiered strategy across the persistence and API layers:

1. **User Locale Preference**: Persisted on `User.locale` using PostgreSQL `enum Locale { ar, en }`, defaulting to `ar`.
2. **Lightweight Entity Columns**: Entities with simple localized names (such as `Cohort`) use dedicated language columns: `name` (English default) and `nameAr` (Arabic display name).
3. **Rich Curriculum and Educational Content**: Modeled as locale-keyed data modules (`Record<"ar" | "en", Record<number, CurriculumWeek>>`) rather than creating database columns for every localized text attribute (`title_ar`, `title_en`, `summary_ar`, `summary_en`, `details_ar`, `details_en`).
4. **API Resolution and Monolingual Wire Responses**:
   - Public and authenticated endpoints accept an explicit `?locale=ar|en` query parameter (defaulting to `ar`).
   - Controllers and ValidationPipes validate the parameter against the `Locale` enum.
   - The API resolves and returns monolingual DTO responses in the requested language. Clients never receive mixed bilingual field clutter.
   - If localized content is missing for a requested key, the backend safely falls back to Arabic (`ar`), preserving the workshop's primary pedagogical language.

## Why

1. **Prevents Column Explosion**: Adding `_ar` and `_en` columns across every relational table bloats database schemas, complicates indexing, and requires repetitive migrations whenever attributes are added or translated.
2. **Version Control for Curriculum**: Educational materials, weekly outcomes, and assignment briefs contain extensive markdown (`detailsMd`) and resource lists. Storing them in version-controlled data structures allows peer review, git diffs, and rapid curriculum updates without database migration overhead.
3. **Clean Client Contracts**: Frontends consuming `/api/v1/cohorts/:slug/weeks/:num?locale=en` receive a clean, single-language payload matching their current route (`/en/weeks/1`), eliminating client-side locale extraction and conditional language checks in UI components.
4. **Arabic-First Baseline**: Arabic is the native language of ElWarsha. Defaulting to `ar` at the database enum and API parameter levels ensures that internationalization is never an afterthought, while providing full English parity.

## Notes

- When dynamic user-generated multi-language content is required in the future, the system will adopt the **Translation Table** pattern (e.g. `AssignmentTranslation` with `assignmentId`, `locale`, `title`, and `description` under a compound unique constraint `@@unique([assignmentId, locale])`).
