# Vercel Deploy Fix Notes

This package includes a root `vercel.json` for Vercel Services.

## Required environment variables

### Frontend / shared
- `NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/_/backend/api`
- `NEXTAUTH_SECRET=...`
- `NEXTAUTH_URL=https://your-domain.vercel.app`

### Backend / shared
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `FRONTEND_URL=https://your-domain.vercel.app`
- `OPENAI_API_KEY=` optional

## Important
- This project uses **NextAuth v4**, so the correct secret variable is `NEXTAUTH_SECRET`.
- The backend is mounted at `/_/backend`, so the API base must end with `/_/backend/api`.
- A PostgreSQL database is required before deployment.
