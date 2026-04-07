# Cavo GitHub Ready Notes

This package is prepared for direct upload to a GitHub repository.

## Included
- Frontend (Next.js)
- Backend (Express + Prisma)
- Storefront, auth, cart, checkout, orders, reviews
- Admin dashboard and content management
- `mezo.md` files across the project for internal reference

## Before first run
1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Copy `backend/.env.example` to `backend/.env`
3. Install dependencies from the project root: `npm run install:all`
4. Generate Prisma client: `npm run prisma:generate`
5. Run migrations as needed, then seed: `npm run prisma:seed`
6. Start both apps: `npm run dev`

## GitHub upload
- Create a new empty repository on GitHub
- Upload all files in this folder, or push with git
- Do not commit real secrets into `.env` files

## Reference docs
Every important folder contains a `mezo.md` file that explains its purpose and key files.
