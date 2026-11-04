import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { runReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

/**
 * Tum klinikler icin hatirlatma motorunu calistirir.
 * Canlida Vercel Cron her sabah 09:00'da (vercel.json) bu adresi cagirir.
 * Yetki: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const clinics = await db.clinic.findMany({ where: { active: true }, select: { id: true, slug: true } });
  const results: Record<string, { vaccines: number; appointments: number }> = {};
  for (const c of clinics) results[c.slug] = await runReminders(c.id);
  return NextResponse.json({ ok: true, results });
}
