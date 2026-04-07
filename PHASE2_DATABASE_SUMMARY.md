# Cavo Phase 2 — Database Expansion Summary

This phase upgrades the clean environment database from a basic storefront schema into a more complete commerce and site-management schema.

## Added core content models
- `Category`
  - Dynamic categories with bilingual names, slug, image, sort order, activation status, and optional parent category.
- `Banner`
  - Home/category promotional banners with placement, dates, links, and optional product/category targeting.
- `SiteSetting`
  - Key-value settings table for branding, contact details, commerce settings, and future admin-managed configuration.
- `SocialLink`
  - Managed social/contact links such as WhatsApp, Instagram, Telegram, Facebook, and TikTok.
- `ContactSubmission`
  - Contact-us messages with topic and workflow status.
- `Faq`
  - Bilingual FAQ entries with ordering and activation state.

## Added customer support models
- `UserAddress`
  - Saved addresses per user for checkout and repeat orders.

## Upgraded commerce models
- `Product`
  - Replaced fixed enum category with dynamic `Category` relation.
  - Added slug, SEO fields, featured image, content summaries, brand, SKU, flags (`isFeatured`, `isNewArrival`, `isOnSale`), and timestamps.
- `ProductVariant`
  - Size/color variants now support optional SKU, price override, image, and active state.
- `Order`
  - Now stores customer snapshot fields, full shipping info, order number, subtotal/shipping/discount breakdown, payment reference, receipt URL, and update timestamps.
- `OrderItem`
  - Stores product snapshot info (name, slug, size, color) to preserve order history even if product data changes later.
- `Review`
  - Added approval workflow and title field.
- `CartItem`
  - Added selected size/color snapshots and timestamps.

## Seed support added
- `backend/src/prisma/seed.ts`
  - Seeds starter categories, site settings, social links, one hero banner, and starter FAQs.

## Updated backend scripts
- `prisma:generate`
- `prisma:migrate`
- `prisma:studio`
- `prisma:seed`

## Important note for next phase
The backend routes still need to be updated to match the new schema, especially:
- `products.ts`
- `orders.ts`
- `users.ts`
- future routes for categories, settings, social links, contact submissions, banners, and upload
