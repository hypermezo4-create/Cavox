import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Router } from "express";
import { auth } from "../middleware/auth";
import { adminOnly } from "../middleware/admin";

const router = Router();

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const fileName = String(req.body?.fileName || "").trim();
    const dataBase64 = String(req.body?.dataBase64 || "");

    if (!fileName || !dataBase64) {
      return res.status(400).json({ message: "fileName and dataBase64 are required" });
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg"];
    const extension = path.extname(fileName).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({ message: "Only image uploads are allowed" });
    }

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const uploadRoot = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadRoot, { recursive: true });

    const normalizedBase64 = dataBase64.includes(",") ? dataBase64.split(",").pop() || "" : dataBase64;
    const buffer = Buffer.from(normalizedBase64, "base64");

    const maxSizeBytes = 5 * 1024 * 1024;
    if (!buffer.length || buffer.length > maxSizeBytes) {
      return res.status(400).json({ message: "Image size must be between 1 byte and 5 MB" });
    }

    const fullPath = path.join(uploadRoot, safeName);
    await writeFile(fullPath, buffer);

    return res.status(201).json({
      fileName: safeName,
      url: `/uploads/${safeName}`
    });
  } catch (error) {
    console.error("POST /upload failed", error);
    return res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
