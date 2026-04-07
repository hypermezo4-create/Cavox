import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth, AuthRequest } from "../middleware/auth";
import { generateOrderNumber } from "../utils/order";
import { isNonEmptyString, toNumberOrUndefined, toOptionalString, toPositiveInt } from "../utils/validation";

const router = Router();

type CreateOrderItemInput = {
  productId?: string;
  variantId?: string;
  quantity?: number;
  selectedSize?: string;
  selectedColor?: string;
};

router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const status = toOptionalString(req.query.status);
    const paymentStatus = toOptionalString(req.query.paymentStatus);

    const where: Prisma.OrderWhereInput = {
      ...(req.user?.role === "ADMIN" ? {} : { userId: req.user?.id }),
      ...(status ? { orderStatus: status as any } : {}),
      ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {})
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(orders);
  } catch (error) {
    console.error("GET /orders failed", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/:id", auth, async (req: AuthRequest, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user?.role !== "ADMIN" && order.userId !== req.user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(order);
  } catch (error) {
    console.error("GET /orders/:id failed", error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const items = Array.isArray(body.items) ? (body.items as CreateOrderItemInput[]) : [];

    if (!items.length) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const paymentMethod = String(body.paymentMethod || "").trim().toUpperCase();
    if (!Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressLine1 = String(body.addressLine1 || "").trim();
    const city = String(body.city || "").trim();
    const governorate = String(body.governorate || "").trim();

    if (!addressLine1 || !city || !governorate) {
      return res.status(400).json({ message: "addressLine1, city and governorate are required" });
    }

    const setting = await prisma.siteSetting.findUnique({ where: { key: "default_shipping_fee" } });
    const shippingFee = toNumberOrUndefined(body.shippingFee) ?? toNumberOrUndefined(setting?.value) ?? 0;
    const discountAmount = toNumberOrUndefined(body.discountAmount) ?? 0;

    const resolvedItems = [] as Array<{
      productId: string;
      variantId?: string;
      productNameEn: string;
      productNameAr: string;
      productSlug: string;
      variantSize?: string;
      variantColor?: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Each item must include productId" });
      }

      const quantity = toPositiveInt(item.quantity, 1);
      if (quantity < 1) {
        return res.status(400).json({ message: "Item quantity must be at least 1" });
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });

      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} is unavailable` });
      }

      let chosenVariant = item.variantId
        ? product.variants.find((variant) => variant.id === item.variantId)
        : undefined;

      if (item.variantId && (!chosenVariant || !chosenVariant.isActive)) {
        return res.status(400).json({ message: `Variant ${item.variantId} is unavailable` });
      }

      const availableStock = chosenVariant ? chosenVariant.stock : product.stock;
      if (availableStock < quantity) {
        return res.status(400).json({ message: `${product.nameEn} is out of stock for the requested quantity` });
      }

      const unitPrice = Number(chosenVariant?.priceOverride ?? product.salePrice ?? product.price);
      const variantSize = chosenVariant?.size || toOptionalString(item.selectedSize);
      const variantColor = chosenVariant?.color || toOptionalString(item.selectedColor);

      resolvedItems.push({
        productId: product.id,
        variantId: chosenVariant?.id,
        productNameEn: product.nameEn,
        productNameAr: product.nameAr,
        productSlug: product.slug,
        variantSize,
        variantColor,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity
      });
    }

    const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalPrice = Math.max(0, subtotal + shippingFee - discountAmount);

    const created = await prisma.$transaction(async (tx) => {
      for (const item of resolvedItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          customerName: isNonEmptyString(body.customerName) ? body.customerName.trim() : user.name,
          customerEmail: isNonEmptyString(body.customerEmail) ? body.customerEmail.trim() : user.email,
          customerPhone: isNonEmptyString(body.customerPhone) ? body.customerPhone.trim() : user.phone || "",
          subtotal,
          shippingFee,
          discountAmount,
          totalPrice,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.AWAITING_REVIEW,
          addressLine1,
          addressLine2: toOptionalString(body.addressLine2),
          city,
          governorate,
          country: isNonEmptyString(body.country) ? body.country.trim() : "Egypt",
          postalCode: toOptionalString(body.postalCode),
          notes: toOptionalString(body.notes),
          paymentReference: toOptionalString(body.paymentReference),
          paymentReceiptUrl: toOptionalString(body.paymentReceiptUrl),
          items: {
            create: resolvedItems
          }
        },
        include: {
          items: true
        }
      });

      await tx.cartItem.deleteMany({
        where: {
          userId: user.id,
          productId: { in: resolvedItems.map((item) => item.productId) }
        }
      });

      return order;
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("POST /orders failed", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
});

router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        orderStatus: req.body?.orderStatus,
        paymentStatus: req.body?.paymentStatus,
        paymentReference: req.body?.paymentReference !== undefined ? toOptionalString(req.body.paymentReference) : undefined,
        paymentReceiptUrl: req.body?.paymentReceiptUrl !== undefined ? toOptionalString(req.body.paymentReceiptUrl) : undefined,
        notes: req.body?.notes !== undefined ? toOptionalString(req.body.notes) : undefined
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error("PATCH /orders/:id/status failed", error);
    return res.status(500).json({ message: "Failed to update order" });
  }
});

export default router;
