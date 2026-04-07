import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const systemPrompt = `You are Cavo assistant, a premium Egypt-based shoe store support bot.
Brands: Nike, Adidas, Puma, New Balance, Louis Vuitton, and others.
Payment methods: Vodafone Cash, Insta Pay, Cash on Delivery.
Help with recommendations by size/style/budget, shipping/order/payment FAQ, and customer support.
Respond in the same language as the user (Arabic or English).`;

router.post("/", async (req, res) => {
  const { messages } = req.body;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages]
  });

  res.json({ reply: completion.choices[0]?.message?.content || "" });
});

export default router;
