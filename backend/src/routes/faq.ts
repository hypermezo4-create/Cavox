import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import { toBoolean, toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const categoryKey = toOptionalString(req.query.categoryKey);
    const includeInactive = toBoolean(req.query.includeInactive, false);

    const faqs = await prisma.faq.findMany({
      where: {
        ...(categoryKey ? { categoryKey } : {}),
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: [{ categoryKey: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return res.json(faqs);
  } catch (error) {
    console.error("GET /faq failed", error);
    return res.status(500).json({ message: "Failed to fetch FAQs" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const created = await prisma.faq.create({
      data: {
        categoryKey: String(req.body?.categoryKey || "general").trim(),
        questionEn: String(req.body?.questionEn || "").trim(),
        questionAr: String(req.body?.questionAr || "").trim(),
        answerEn: String(req.body?.answerEn || "").trim(),
        answerAr: String(req.body?.answerAr || "").trim(),
        sortOrder: toPositiveInt(req.body?.sortOrder, 0),
        isActive: toBoolean(req.body?.isActive, true)
      }
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("POST /faq failed", error);
    return res.status(500).json({ message: "Failed to create FAQ" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const updated = await prisma.faq.update({
      where: { id: req.params.id },
      data: {
        categoryKey: req.body?.categoryKey !== undefined ? String(req.body.categoryKey).trim() : undefined,
        questionEn: req.body?.questionEn !== undefined ? String(req.body.questionEn).trim() : undefined,
        questionAr: req.body?.questionAr !== undefined ? String(req.body.questionAr).trim() : undefined,
        answerEn: req.body?.answerEn !== undefined ? String(req.body.answerEn).trim() : undefined,
        answerAr: req.body?.answerAr !== undefined ? String(req.body.answerAr).trim() : undefined,
        sortOrder: req.body?.sortOrder !== undefined ? toPositiveInt(req.body.sortOrder, 0) : undefined,
        isActive: req.body?.isActive !== undefined ? toBoolean(req.body.isActive, true) : undefined
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error("PUT /faq/:id failed", error);
    return res.status(500).json({ message: "Failed to update FAQ" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /faq/:id failed", error);
    return res.status(500).json({ message: "Failed to delete FAQ" });
  }
});

export default router;
