This patch removes the public storefront route group from the root URL path to avoid a Next.js App Router client-reference manifest bug seen during prerendering on Vercel.

What changed:
- `frontend/app/(store)` was renamed to `frontend/app/store`
- root `/` is now handled by `redirects()` in `frontend/next.config.js`
- friendly public URLs (`/shop`, `/cart`, `/products/...`, etc.) are preserved with `rewrites()`
- `frontend/app/layout.tsx` is minimal
- `frontend/app/store/layout.tsx` now owns the storefront shell and auth session provider
- `frontend/app/admin/layout.tsx` now wraps admin pages in `AuthSessionProvider`

After updating GitHub, redeploy on Vercel without build cache.
