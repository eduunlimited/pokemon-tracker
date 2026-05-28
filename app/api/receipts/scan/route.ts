import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractReceiptData } from "@/lib/ocr";
import { saveReceiptImage } from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Receipt image is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";

  try {
    const [extraction, storage] = await Promise.all([
      extractReceiptData(buffer, mimeType),
      saveReceiptImage(file),
    ]);

    const receipt = await prisma.receipt.create({
      data: {
        imageUrl: storage.imageUrl,
        extractedData: JSON.stringify(extraction),
      },
    });

    return NextResponse.json({ ...extraction, receiptId: receipt.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to scan receipt";
    return NextResponse.json({ message }, { status: 500 });
  }
}
