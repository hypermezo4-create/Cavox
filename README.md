# Cavo final merged workspace

Cavo is a bilingual shoe-store workspace built with:

- **Frontend:** Next.js 14, React, NextAuth, Tailwind CSS
- **Backend:** Express, Prisma, PostgreSQL, JWT auth
- **Commerce features:** products, variants, cart, checkout, orders, reviews
- **Admin features:** products, categories, banners, users, orders, settings, social links, contact inbox

## Project structure

```text
cavo-workspace/
├── frontend/   # Storefront + admin UI
├── backend/    # Express API + Prisma schema
└── package.json
```

## 1) Setup

### Backend env
Copy `backend/.env.example` to `backend/.env` and fill in values.

### Frontend env
Copy `frontend/.env.example` to `frontend/.env.local` and fill in values.

## 2) Install

From the project root:

```bash
npm run install:all
```

Or install each app separately:

```bash
npm run install:frontend
npm run install:backend
```

## 3) Prisma

Generate the Prisma client and seed the database:

```bash
npm run prisma:generate
npm run prisma:seed
```

For first-time local development, also run a migration:

```bash
cd backend
npm run prisma:migrate
```

## 4) Run locally

Use two terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## What is included

### Storefront
- Home, Shop, Men, Women, Kids, Offers
- Product details with variants
- Cart
- Checkout
- Order confirmation
- About, Contact, Privacy Policy, Terms of Service
- Arabic/English direction toggle and dark theme styling

### Authentication
- Register
- Login with NextAuth credentials provider
- Protected checkout
- Admin-protected dashboard routes

### Admin
- Dashboard overview
- Products CRUD
- Categories CRUD
- Banners CRUD
- Orders management
- Users management
- Site settings
- Social links
- Contact submissions inbox

### Backend API
- Users/auth
- Products
- Categories
- Cart
- Orders
- Reviews
- Settings
- Social links
- Contact
- FAQ
- Banners
- Uploads

## Final cleanup completed
- Legacy ROM/device/download traces removed from source
- Temporary build artifacts excluded with `.gitignore`
- Upload directory prepared for local runtime
- Workspace scripts improved for setup and validation

## Validation note
The source tree was cleaned and cross-checked for missing local imports and legacy naming remnants. In this environment, a full package install/build could not be verified end-to-end because the required npm binaries were not fully available after install resolution, so you should run the install/build steps locally after extracting the archive.
