# Cavo (Devices / ROMs / Team / Notifications + Download Tracking)

## Setup
1) Create a Supabase project.
2) Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3) In Supabase SQL Editor, run: `supabase/schema.sql`
4) Add the 2 owner emails into table `owners_allowlist`.

## Run
npm i
npm run dev
