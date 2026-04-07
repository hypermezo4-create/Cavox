import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import { isNonEmptyString, toOptionalString } from "../utils/validation";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const group = toOptionalString(req.query.group);
    const rows = await prisma.siteSetting.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: "asc" }, { key: "asc" }]
    });

    const asMap = rows.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return res.json({ items: rows, map: asMap });
  } catch (error) {
    console.error("GET /settings failed", error);
    return res.status(500).json({ message: "Failed to fetch settings" });
  }
});

router.put("/", auth, adminOnly, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ message: "items array is required" });
    }

    const updated = await prisma.$transaction(
      items.map((item: any) =>
        prisma.siteSetting.upsert({
          where: { key: String(item.key || "").trim() },
          update: {
            group: isNonEmptyString(item.group) ? item.group.trim() : "general",
            label: toOptionalString(item.label),
            value: String(item.value ?? "")
          },
          create: {
            key: String(item.key || "").trim(),
            group: isNonEmptyString(item.group) ? item.group.trim() : "general",
            label: toOptionalString(item.label),
            value: String(item.value ?? "")
          }
        })
      )
    );

    return res.json(updated);
  } catch (error) {
    console.error("PUT /settings failed", error);
    return res.status(500).json({ message: "Failed to update settings" });
  }
});

export default router;
