# Final release notes

## What was cleaned in this final pass
- Removed bundled `.next` output from the deliverable
- Removed partial `node_modules` directories from the deliverable
- Added root workspace scripts for install, typecheck, Prisma generate, and seed
- Added a project-wide `.gitignore`
- Prepared `backend/public/uploads/.gitkeep` for image uploads
- Added final setup and run documentation in `README.md`

## Best next local commands
```bash
npm run install:all
npm run prisma:generate
cd backend && npm run prisma:migrate && npm run prisma:seed
npm run dev:backend
npm run dev:frontend
```

## Recommended first admin seed
After seeding, create or promote one user to `ADMIN` in the database before using the admin dashboard.
