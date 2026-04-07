import { Router } from "express";
import { prisma } from "../index";
import { auth, AuthRequest } from "../middleware/auth";
import { toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: true,
        variant: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(items);
  } catch (error) {
    console.error("GET /cart failed", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const productId = String(req.body?.productId || "").trim();
    const variantId = toOptionalString(req.body?.variantId);
    const selectedSize = toOptionalString(req.body?.selectedSize);
    const selectedColor = toOptionalString(req.body?.selectedColor);
    const quantity = toPositiveInt(req.body?.quantity, 1);

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: req.user!.id,
        productId,
        variantId: variantId ?? null,
        selectedSize: selectedSize ?? null,
        selectedColor: selectedColor ?? null
      }
    });

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: { increment: quantity } },
          include: { product: true, variant: true }
        })
      : await prisma.cartItem.create({
          data: {
            userId: req.user!.id,
            productId,
            variantId,
            selectedSize,
            selectedColor,
            quantity
          },
          include: { product: true, variant: true }
        });

    return res.status(201).json(item);
  } catch (error) {
    console.error("POST /cart failed", error);
    return res.status(500).json({ message: "Failed to add item to cart" });
  }
});

router.patch("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const quantity = toPositiveInt(req.body?.quantity, 1);
    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
      include: { product: true, variant: true }
    });

    return res.json(item);
  } catch (error) {
    console.error("PATCH /cart/:id failed", error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.user!.id) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /cart/:id failed", error);
    return res.status(500).json({ message: "Failed to remove cart item" });
  }
});

router.delete("/", auth, async (req: AuthRequest, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });
    return res.status(204).send();
  } catch (error) {
    console.error("DELETE /cart failed", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
});

export default router;
