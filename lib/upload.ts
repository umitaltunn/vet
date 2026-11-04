import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const OK = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

/** Formdan gelen dosyayi data/uploads/<klinik>/ altina kaydeder ve URL'ini dondurur. */
export async function saveUpload(file: File | null, clinicId: string): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > 6 * 1024 * 1024) throw new Error("Dosya 6 MB'dan büyük olamaz.");
  const ext = path.extname(file.name).toLowerCase();
  if (!OK.has(ext)) throw new Error("Sadece PNG, JPG, WEBP veya GIF yükleyebilirsiniz.");
  const dir = path.join(process.cwd(), "data", "uploads", clinicId);
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/api/files/${clinicId}/${name}`;
}
