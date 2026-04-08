# Cavo Vercel Work-First Notes

This patch focuses on getting the frontend deployable first.

## What changed
- `/` now redirects to `/shop` to avoid homepage prerender instability on Vercel.
- Added `app/loading.tsx`, `app/error.tsx`, and `app/not-found.tsx` to align with App Router conventions.

## Recommended next restructure
For long-term Vercel-friendly structure, move to a monorepo layout:
- `apps/web` for the Next.js storefront/admin
- `apps/api` for the Express/Prisma backend
- Root workspace scripts for install/build/dev

Vercel docs recommend monorepo support from the repository root, while Services are still beta.
