import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import { toBoolean, toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const includeInactive = toBoolean(req.query.includeInactive, false);
    const links = await prisma.socialLink.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return res.json(links);
  } catch (error) {
    console.error("GET /social failed", error);
    return res.status(500).json({ message: "Failed to fetch social links" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const link = await prisma.socialLink.create({
      data: {
        platform: String(req.body?.platform || "").trim().toUpperCase() as any,
        label: toOptionalString(req.body?.label),
        url: String(req.body?.url || "").trim(),
        icon: toOptionalString(req.body?.icon),
        sortOrder: toPositiveInt(req.body?.sortOrder, 0),
        isActive: toBoolean(req.body?.isActive, true)
      }
    });

    return res.status(201).json(link);
  } catch (error) {
    console.error("POST /social failed", error);
    return res.status(500).json({ message: "Failed to create social link" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const link = await prisma.socialLink.update({
      where: { id: req.params.id },
      data: {
        platform: req.body?.platform ? String(req.body.platform).trim().toUpperCase() as any : undefined,
        label: req.body?.label !== undefined ? toOptionalString(req.body.label) : undefined,
        url: req.body?.url !== undefined ? String(req.body.url).trim() : undefined,
        icon: req.body?.icon !== undefined ? toOptionalString(req.body.icon) : undefined,
        sortOrder: req.body?.sortOrder !== undefined ? toPositiveInt(req.body.sortOrder, 0) : undefined,
        isActive: req.body?.isActive !== undefined ? toBoolean(req.body.isActive, true) : undefined
      }
    });

    return res.json(link);
  } catch (error) {
    console.error("PUT /social/:id failed", error);
    return res.status(500).json({ message: "Failed to update social link" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await prisma.socialLink.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /social/:id failed", error);
    return res.status(500).json({ message: "Failed to delete social link" });
  }
});

export default router;
