import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth, AuthRequest } from "../middleware/auth";
import { toBoolean, toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

router.get("/product/:productId", async (req, res) => {
  try {
    const includeUnapproved = toBoolean(req.query.includeUnapproved, false);
    const reviews = await prisma.review.findMany({
      where: {
        productId: req.params.productId,
        ...(includeUnapproved ? {} : { isApproved: true })
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(reviews);
  } catch (error) {
    console.error("GET /reviews/product/:productId failed", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const productId = String(req.body?.productId || "").trim();
    const rating = toPositiveInt(req.body?.rating, 0);
    const comment = String(req.body?.comment || "").trim();

    if (!productId || !comment || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "productId, rating (1-5) and comment are required" });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId
        }
      },
      update: {
        rating,
        title: toOptionalString(req.body?.title),
        comment,
        isApproved: false
      },
      create: {
        userId: req.user!.id,
        productId,
        rating,
        title: toOptionalString(req.body?.title),
        comment,
        isApproved: false
      }
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("POST /reviews failed", error);
    return res.status(500).json({ message: "Failed to submit review" });
  }
});

router.patch("/:id/approval", auth, adminOnly, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        isApproved: toBoolean(req.body?.isApproved, false)
      }
    });

    return res.json(review);
  } catch (error) {
    console.error("PATCH /reviews/:id/approval failed", error);
    return res.status(500).json({ message: "Failed to update review approval" });
  }
});

export default router;
