# CHANGELOG

All notable changes to the College ERP project will be documented in this file.

## [1.0.0] - 2026-08-04

### Added
- Complete academic ERP database migrations (`0001_initial_schema.sql` to `0009_indexes.sql`).
- Dynamic user lookup configuration seed scripts (`seed.sql`, `admin.sql`).
- Next.js build validation and production configurations.
- Integrated TailwindCSS config & Flat ESLint rule setups.

### Fixed
- Fixed TypeScript typecheck error in `preferences-actions.ts` caused by dynamic Supabase schema definitions.
