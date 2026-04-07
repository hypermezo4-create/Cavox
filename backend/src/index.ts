import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bannersRouter from "./routes/banners";
import cartRouter from "./routes/cart";
import categoriesRouter from "./routes/categories";
import chatRouter from "./routes/chat";
import contactRouter from "./routes/contact";
import faqRouter from "./routes/faq";
import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import reviewsRouter from "./routes/reviews";
import settingsRouter from "./routes/settings";
import socialRouter from "./routes/social";
import uploadRouter from "./routes/upload";
import usersRouter from "./routes/users";

dotenv.config();

export const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true,
    credentials: true
  })
);
app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")));

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    service: "cavo-backend",
    timestamp: new Date().toISOString()
  })
);

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/social", socialRouter);
app.use("/api/contact", contactRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/faq", faqRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/chat", chatRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled backend error", error);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
const server = app.listen(port, () => {
  console.log(`Cavo backend running on port ${port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
