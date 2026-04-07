import { Router } from "express";
import { prisma } from "../index";
import { adminOnly } from "../middleware/admin";
import { auth } from "../middleware/auth";
import { isEmail, isNonEmptyString, toOptionalString } from "../utils/validation";

const router = Router();

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const status = toOptionalString(req.query.status);
    const topic = toOptionalString(req.query.topic);

    const submissions = await prisma.contactSubmission.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(topic ? { topic: topic as any } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(submissions);
  } catch (error) {
    console.error("GET /contact failed", error);
    return res.status(500).json({ message: "Failed to fetch contact submissions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "name, email, subject and message are required" });
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const created = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: toOptionalString(req.body?.phone),
        topic: (isNonEmptyString(req.body?.topic) ? req.body.topic.trim().toUpperCase() : "GENERAL") as any,
        subject,
        message
      }
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("POST /contact failed", error);
    return res.status(500).json({ message: "Failed to submit contact form" });
  }
});

router.patch("/:id", auth, adminOnly, async (req, res) => {
  try {
    const updated = await prisma.contactSubmission.update({
      where: { id: req.params.id },
      data: {
        status: req.body?.status,
        adminNotes: req.body?.adminNotes !== undefined ? toOptionalString(req.body.adminNotes) : undefined
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error("PATCH /contact/:id failed", error);
    return res.status(500).json({ message: "Failed to update contact submission" });
  }
});

export default router;
