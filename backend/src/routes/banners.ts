import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import { toBoolean, toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const placement = toOptionalString(req.query.placement);
    const includeInactive = toBoolean(req.query.includeInactive, false);

    const banners = await prisma.banner.findMany({
      where: {
        ...(placement ? { placement: placement as any } : {}),
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        category: { select: { id: true, nameEn: true, slug: true } },
        product: { select: { id: true, nameEn: true, slug: true } }
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return res.json(banners);
  } catch (error) {
    console.error("GET /banners failed", error);
    return res.status(500).json({ message: "Failed to fetch banners" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const created = await prisma.banner.create({
      data: {
        categoryId: toOptionalString(req.body?.categoryId),
        productId: toOptionalString(req.body?.productId),
        titleEn: String(req.body?.titleEn || "").trim(),
        titleAr: String(req.body?.titleAr || "").trim(),
        subtitleEn: toOptionalString(req.body?.subtitleEn),
        subtitleAr: toOptionalString(req.body?.subtitleAr),
        imageUrl: String(req.body?.imageUrl || "").trim(),
        mobileImageUrl: toOptionalString(req.body?.mobileImageUrl),
        linkUrl: toOptionalString(req.body?.linkUrl),
        placement: String(req.body?.placement || "HOME_HERO").trim().toUpperCase() as any,
        sortOrder: toPositiveInt(req.body?.sortOrder, 0),
        isActive: toBoolean(req.body?.isActive, true),
        startsAt: req.body?.startsAt ? new Date(String(req.body.startsAt)) : undefined,
        endsAt: req.body?.endsAt ? new Date(String(req.body.endsAt)) : undefined
      }
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("POST /banners failed", error);
    return res.status(500).json({ message: "Failed to create banner" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const updated = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        categoryId: req.body?.categoryId !== undefined ? toOptionalString(req.body.categoryId) : undefined,
        productId: req.body?.productId !== undefined ? toOptionalString(req.body.productId) : undefined,
        titleEn: req.body?.titleEn !== undefined ? String(req.body.titleEn).trim() : undefined,
        titleAr: req.body?.titleAr !== undefined ? String(req.body.titleAr).trim() : undefined,
        subtitleEn: req.body?.subtitleEn !== undefined ? toOptionalString(req.body.subtitleEn) : undefined,
        subtitleAr: req.body?.subtitleAr !== undefined ? toOptionalString(req.body.subtitleAr) : undefined,
        imageUrl: req.body?.imageUrl !== undefined ? String(req.body.imageUrl).trim() : undefined,
        mobileImageUrl: req.body?.mobileImageUrl !== undefined ? toOptionalString(req.body.mobileImageUrl) : undefined,
        linkUrl: req.body?.linkUrl !== undefined ? toOptionalString(req.body.linkUrl) : undefined,
        placement: req.body?.placement !== undefined ? String(req.body.placement).trim().toUpperCase() as any : undefined,
        sortOrder: req.body?.sortOrder !== undefined ? toPositiveInt(req.body.sortOrder, 0) : undefined,
        isActive: req.body?.isActive !== undefined ? toBoolean(req.body.isActive, true) : undefined,
        startsAt: req.body?.startsAt !== undefined ? (req.body.startsAt ? new Date(String(req.body.startsAt)) : null) : undefined,
        endsAt: req.body?.endsAt !== undefined ? (req.body.endsAt ? new Date(String(req.body.endsAt)) : null) : undefined
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error("PUT /banners/:id failed", error);
    return res.status(500).json({ message: "Failed to update banner" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /banners/:id failed", error);
    return res.status(500).json({ message: "Failed to delete banner" });
  }
});

export default router;
