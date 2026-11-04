import { readFile } from "fs/promises";
import path from "path";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ROOT = path.join(process.cwd(), "data", "uploads");
const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };

/** Panelden yuklenen gorselleri sunar (data/uploads klasorunden). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const file = path.normalize(path.join(ROOT, ...parts));
  if (!file.startsWith(ROOT + path.sep)) return new Response("Yasak", { status: 403 });
  try {
    const buf = await readFile(file);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
