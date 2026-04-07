import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import { isNonEmptyString, slugify, toBoolean, toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const includeInactive = toBoolean(req.query.includeInactive, false);
    const homeOnly = toBoolean(req.query.homeOnly, false);

    const categories = await prisma.category.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(homeOnly ? { showOnHome: true } : {})
      },
      include: {
        _count: {
          select: {
            products: true,
            children: true
          }
        },
        parent: {
          select: { id: true, nameEn: true, nameAr: true, slug: true }
        }
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return res.json(categories);
  } catch (error) {
    console.error("GET /categories failed", error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error("GET /categories/:id failed", error);
    return res.status(500).json({ message: "Failed to fetch category" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const nameEn = String(body.nameEn || "").trim();
    const nameAr = String(body.nameAr || "").trim();
    const slug = slugify(String(body.slug || nameEn));

    if (!nameEn || !nameAr || !slug) {
      return res.status(400).json({ message: "nameEn, nameAr and slug are required" });
    }

    const created = await prisma.category.create({
      data: {
        parentId: toOptionalString(body.parentId),
        nameEn,
        nameAr,
        slug,
        descriptionEn: toOptionalString(body.descriptionEn),
        descriptionAr: toOptionalString(body.descriptionAr),
        image: toOptionalString(body.image),
        sortOrder: toPositiveInt(body.sortOrder, 0),
        isActive: toBoolean(body.isActive, true),
        showOnHome: toBoolean(body.showOnHome, false)
      }
    });

    return res.status(201).json(created);
  } catch (error: any) {
    console.error("POST /categories failed", error);
    return res.status(400).json({ message: error?.message || "Failed to create category" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const body = req.body as Record<string, unknown>;
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        parentId: body.parentId === null ? null : toOptionalString(body.parentId) ?? existing.parentId,
        nameEn: isNonEmptyString(body.nameEn) ? body.nameEn.trim() : existing.nameEn,
        nameAr: isNonEmptyString(body.nameAr) ? body.nameAr.trim() : existing.nameAr,
        slug: isNonEmptyString(body.slug) ? slugify(body.slug) : existing.slug,
        descriptionEn: body.descriptionEn !== undefined ? toOptionalString(body.descriptionEn) : existing.descriptionEn,
        descriptionAr: body.descriptionAr !== undefined ? toOptionalString(body.descriptionAr) : existing.descriptionAr,
        image: body.image !== undefined ? toOptionalString(body.image) : existing.image,
        sortOrder: body.sortOrder !== undefined ? toPositiveInt(body.sortOrder, existing.sortOrder) : existing.sortOrder,
        isActive: body.isActive !== undefined ? toBoolean(body.isActive, existing.isActive) : existing.isActive,
        showOnHome: body.showOnHome !== undefined ? toBoolean(body.showOnHome, existing.showOnHome) : existing.showOnHome
      }
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("PUT /categories/:id failed", error);
    return res.status(400).json({ message: error?.message || "Failed to update category" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const [productsCount, childrenCount] = await Promise.all([
      prisma.product.count({ where: { categoryId: req.params.id } }),
      prisma.category.count({ where: { parentId: req.params.id } })
    ]);

    if (productsCount > 0 || childrenCount > 0) {
      return res.status(409).json({
        message: "Cannot delete category while it still has products or subcategories"
      });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /categories/:id failed", error);
    return res.status(500).json({ message: "Failed to delete category" });
  }
});

export default router;
