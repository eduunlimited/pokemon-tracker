import OpenAI from "openai";
import type { ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export interface ReceiptExtraction {
  receiptId: string;
  vendor: string;
  date: string;
  total: number;
  lineItems: string[];
  suggestedCategory: ExpenseCategory;
}

function normalizeCategory(value: string): ExpenseCategory {
  const match = EXPENSE_CATEGORIES.find(
    (category) => category.toLowerCase() === value.toLowerCase(),
  );
  return match ?? "Other";
}

export async function extractReceiptData(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ReceiptExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({ apiKey });
  const base64 = imageBuffer.toString("base64");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Extract receipt data for a Pokemon reselling business expense tracker. Return JSON with keys: vendor (string), date (YYYY-MM-DD), total (number), lineItems (string array), suggestedCategory (one of: Store Purchases, Parking, Entry Tickets, Supplies, Shipping, Other). Use best guess for missing fields.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the receipt details from this image.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No extraction result returned");
  }

  const parsed = JSON.parse(content) as Partial<ReceiptExtraction>;
  return {
    receiptId: "",
    vendor: parsed.vendor?.trim() || "Unknown vendor",
    date: parsed.date || new Date().toISOString().split("T")[0],
    total: Number(parsed.total) || 0,
    lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : [],
    suggestedCategory: normalizeCategory(parsed.suggestedCategory || "Other"),
  };
}
