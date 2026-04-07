# app mezo

This is the Next.js App Router root. The homepage (`/`) is defined in `app/page.tsx` on purpose.

Why: Vercel/Next.js can fail packaging a root route that lives only inside a route group like `app/(store)/page.tsx`, with a missing `page_client-reference-manifest.js` error. Keeping the homepage in `app/page.tsx` avoids that deployment issue.
