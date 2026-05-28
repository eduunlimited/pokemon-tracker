import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

export async function saveReceiptImage(
  file: File,
): Promise<{ imageUrl: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `receipt-${Date.now()}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`receipts/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { imageUrl: blob.url };
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "receipts");
  await mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return { imageUrl: `/uploads/receipts/${filename}` };
}
