import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { prettyPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

/** Hatirlatma linkinden gelen kisinin formunu doldurmak icin. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json(null, { status: 400 });
  const r = await db.reminder.findUnique({ where: { token }, include: { pet: { include: { owner: true } } } });
  if (!r || !r.pet) return NextResponse.json(null, { status: 404 });
  const service = await db.service.findFirst({
    where: { clinicId: r.clinicId, bookable: true, OR: [{ name: { contains: "Aşı" } }, { name: { contains: "Muayene" } }] },
    orderBy: { order: "asc" },
  });
  return NextResponse.json({
    ownerName: r.pet.owner.name,
    ownerPhone: prettyPhone(r.pet.owner.phone),
    petName: r.pet.name,
    petSpecies: r.pet.species,
    serviceId: r.type === "ASI" ? service?.id ?? null : null,
  });
}
