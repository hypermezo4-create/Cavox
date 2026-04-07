import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth, AuthRequest } from "../middleware/auth";
import { signAccessToken } from "../utils/auth";
import { isEmail, isNonEmptyString, toOptionalString } from "../utils/validation";

const router = Router();

function sanitizeUser<T extends { passwordHash?: string | null }>(user: T) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const phone = toOptionalString(req.body?.phone);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone
      }
    });

    const token = signAccessToken({ id: user.id, role: user.role });
    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error("POST /users/register failed", error);
    return res.status(500).json({ message: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signAccessToken({ id: user.id, role: user.role });
    return res.json({ user: sanitizeUser(user), token });
  } catch (error) {
    console.error("POST /users/login failed", error);
    return res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/me", auth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        addresses: true,
        _count: {
          select: {
            orders: true,
            cartItems: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("GET /users/me failed", error);
    return res.status(500).json({ message: "Failed to fetch current user" });
  }
});

router.patch("/me", auth, async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: isNonEmptyString(req.body?.name) ? req.body.name.trim() : undefined,
        phone: req.body?.phone !== undefined ? toOptionalString(req.body.phone) : undefined,
        avatarUrl: req.body?.avatarUrl !== undefined ? toOptionalString(req.body.avatarUrl) : undefined
      }
    });

    return res.json(sanitizeUser(updated));
  } catch (error) {
    console.error("PATCH /users/me failed", error);
    return res.status(500).json({ message: "Failed to update current user" });
  }
});

router.get("/", auth, adminOnly, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            cartItems: true,
            reviews: true,
            addresses: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(users.map((user) => sanitizeUser(user)));
  } catch (error) {
    console.error("GET /users failed", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { items: true }
        },
        _count: {
          select: { reviews: true, cartItems: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    console.error("GET /users/:id failed", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.patch("/:id/role", auth, adminOnly, async (req, res) => {
  try {
    const role = String(req.body?.role || "").trim().toUpperCase();

    if (!["ADMIN", "CUSTOMER"].includes(role)) {
      return res.status(400).json({ message: "Role must be ADMIN or CUSTOMER" });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: role as "ADMIN" | "CUSTOMER" }
    });

    return res.json(sanitizeUser(updated));
  } catch (error) {
    console.error("PATCH /users/:id/role failed", error);
    return res.status(500).json({ message: "Failed to update user role" });
  }
});

export default router;
