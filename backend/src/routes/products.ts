import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import {
  isNonEmptyString,
  slugify,
  toBoolean,
  toNumberOrUndefined,
  toOptionalString,
  toPositiveInt,
  toStringArray
} from "../utils/validation";

const router = Router();

type VariantInput = {
  id?: string;
  size?: string;
  color?: string;
  sku?: string;
  stock?: number;
  priceOverride?: number;
  image?: string;
  isActive?: boolean;
};

function buildVariantPayload(variants: VariantInput[] | undefined) {
  if (!Array.isArray(variants)) return [];

  return variants
    .filter((variant) => isNonEmptyString(variant.size) && isNonEmptyString(variant.color))
    .map((variant) => ({
      size: String(variant.size).trim(),
      color: String(variant.color).trim(),
      sku: toOptionalString(variant.sku),
      stock: toPositiveInt(variant.stock, 0),
      priceOverride: toNumberOrUndefined(variant.priceOverride),
      image: toOptionalString(variant.image),
      isActive: toBoolean(variant.isActive, true)
    }));
}

async function resolveCategoryId(body: Record<string, unknown>) {
  if (isNonEmptyString(body.categoryId)) return body.categoryId.trim();
  if (isNonEmptyString(body.categorySlug)) {
    const category = await prisma.category.findUnique({
      where: { slug: body.categorySlug.trim() },
      select: { id: true }
    });
    return category?.id;
  }
  return undefined;
}

function buildProductPayload(body: Record<string, unknown>, categoryId: string) {
  const nameEn = String(body.nameEn || "").trim();
  const nameAr = String(body.nameAr || "").trim();
  const brand = String(body.brand || "").trim();
  const descriptionEn = String(body.descriptionEn || "").trim();
  const descriptionAr = String(body.descriptionAr || "").trim();
  const price = toNumberOrUndefined(body.price);

  if (!nameEn || !nameAr || !brand || !descriptionEn || !descriptionAr) {
    throw new Error("Missing required product fields");
  }

  if (price === undefined || price < 0) {
    throw new Error("Product price is invalid");
  }

  const explicitSlug = toOptionalString(body.slug);

  return {
    categoryId,
    nameEn,
    nameAr,
    slug: explicitSlug ? slugify(explicitSlug) : slugify(nameEn),
    shortDescriptionEn: toOptionalString(body.shortDescriptionEn),
    shortDescriptionAr: toOptionalString(body.shortDescriptionAr),
    descriptionEn,
    descriptionAr,
    brand,
    sku: toOptionalString(body.sku),
    price,
    salePrice: toNumberOrUndefined(body.salePrice),
    currency: toOptionalString(body.currency) || "EGP",
    featuredImage: toOptionalString(body.featuredImage),
    images: toStringArray(body.images),
    sizes: toStringArray(body.sizes),
    colors: toStringArray(body.colors),
    stock: toPositiveInt(body.stock, 0),
    isActive: toBoolean(body.isActive, true),
    isFeatured: toBoolean(body.isFeatured, false),
    isNewArrival: toBoolean(body.isNewArrival, false),
    isOnSale: toBoolean(body.isOnSale, false),
    metaTitleEn: toOptionalString(body.metaTitleEn),
    metaTitleAr: toOptionalString(body.metaTitleAr),
    metaDescriptionEn: toOptionalString(body.metaDescriptionEn),
    metaDescriptionAr: toOptionalString(body.metaDescriptionAr)
  };
}

const productInclude = {
  category: true,
  variants: {
    orderBy: [{ size: "asc" }, { color: "asc" }]
  },
  reviews: {
    where: { isApproved: true },
    orderBy: { createdAt: "desc" }
  },
  _count: {
    select: { reviews: true }
  }
} satisfies Prisma.ProductInclude;

router.get("/", async (req, res) => {
  try {
    const {
      brand,
      category,
      categoryId,
      minPrice,
      maxPrice,
      sort = "newest",
      q,
      featured,
      newArrival,
      onSale,
      includeInactive,
      page = "1",
      limit = "12"
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const take = Math.min(48, Math.max(1, Number(limit) || 12));
    const skip = (currentPage - 1) * take;

    const where: Prisma.ProductWhereInput = {
      ...(toBoolean(includeInactive, false) ? {} : { isActive: true }),
      ...(isNonEmptyString(brand) ? { brand: { equals: String(brand).trim(), mode: "insensitive" } } : {}),
      ...(isNonEmptyString(categoryId)
        ? { categoryId: String(categoryId).trim() }
        : isNonEmptyString(category)
          ? { category: { slug: String(category).trim() } }
          : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              gte: toNumberOrUndefined(minPrice),
              lte: toNumberOrUndefined(maxPrice)
            }
          }
        : {}),
      ...(toBoolean(featured, false) ? { isFeatured: true } : {}),
      ...(toBoolean(newArrival, false) ? { isNewArrival: true } : {}),
      ...(toBoolean(onSale, false) ? { isOnSale: true } : {}),
      ...(isNonEmptyString(q)
        ? {
            OR: [
              { nameEn: { contains: String(q).trim(), mode: "insensitive" } },
              { nameAr: { contains: String(q).trim(), mode: "insensitive" } },
              { brand: { contains: String(q).trim(), mode: "insensitive" } },
              { slug: { contains: slugify(String(q).trim()) } }
            ]
          }
        : {})
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take,
        orderBy:
          sort === "price-asc"
            ? { price: "asc" }
            : sort === "price-desc"
              ? { price: "desc" }
              : sort === "best-rated"
                ? { reviews: { _count: "desc" } }
                : { createdAt: "desc" }
      }),
      prisma.product.count({ where })
    ]);

    return res.json({
      items: products,
      pagination: {
        page: currentPage,
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error("GET /products failed", error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: productInclude
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("GET /products/slug failed", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.get("/admin/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: productInclude
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("GET /products/admin/:id failed", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const includeInactive = toBoolean(req.query.includeInactive, false);
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: productInclude
    });

    if (!product || (!includeInactive && !product.isActive)) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("GET /products/:id failed", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const categoryId = await resolveCategoryId(body);

    if (!categoryId) {
      return res.status(400).json({ message: "Category is required" });
    }

    const productData = buildProductPayload(body, categoryId);
    const variants = buildVariantPayload(body.variants as VariantInput[] | undefined);

    const created = await prisma.product.create({
      data: {
        ...productData,
        variants: variants.length ? { create: variants } : undefined
      },
      include: productInclude
    });

    return res.status(201).json(created);
  } catch (error: any) {
    console.error("POST /products failed", error);
    return res.status(400).json({ message: error?.message || "Failed to create product" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: true }
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const body = req.body as Record<string, unknown>;
    const categoryId = (await resolveCategoryId(body)) || existing.categoryId;
    const productData = buildProductPayload(
      {
        ...existing,
        ...body,
        categoryId
      } as unknown as Record<string, unknown>,
      categoryId
    );

    const variants = buildVariantPayload(body.variants as VariantInput[] | undefined);

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.variants)) {
        await tx.productVariant.deleteMany({ where: { productId: existing.id } });
      }

      return tx.product.update({
        where: { id: existing.id },
        data: {
          ...productData,
          variants: Array.isArray(body.variants) && variants.length ? { create: variants } : undefined
        },
        include: productInclude
      });
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("PUT /products/:id failed", error);
    return res.status(400).json({ message: error?.message || "Failed to update product" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /products/:id failed", error);
    return res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
