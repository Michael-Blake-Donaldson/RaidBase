import { afterEach, describe, expect, it } from "vitest";
import { rm } from "fs/promises";
import path from "path";

import { saveUploadedClipFile } from "@/server/services/clip-storage";

describe("clip storage service", () => {
  afterEach(async () => {
    await rm(path.join(process.cwd(), "public", "uploads", "clips"), { recursive: true, force: true });
  });

  it("writes uploaded clips into the public uploads area and returns the public URL", async () => {
    const stored = await saveUploadedClipFile({
      mimeType: "video/mp4",
      fileBuffer: Buffer.from("clip-data"),
    });

    expect(stored.provider).toBe("Upload");
    expect(stored.publicUrl).toMatch(/^\/uploads\/clips\/.+\.mp4$/);
    expect(stored.storagePath).toContain(path.join("public", "uploads", "clips"));
  });
});