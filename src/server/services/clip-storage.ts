import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const extensionByMimeType: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

type SaveClipFileInput = {
  mimeType: string;
  fileBuffer: Buffer;
};

export async function saveUploadedClipFile({ mimeType, fileBuffer }: SaveClipFileInput) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "clips");
  await mkdir(uploadDir, { recursive: true });

  const extension = extensionByMimeType[mimeType] ?? ".mp4";
  const clipFilename = `${randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, clipFilename);

  await writeFile(filePath, fileBuffer);

  return {
    provider: "Upload",
    publicUrl: `/uploads/clips/${clipFilename}`,
    storagePath: filePath,
  };
}