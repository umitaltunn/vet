import { NextResponse, type NextRequest } from "next/server";
import { getSlots } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const clinicId = sp.get("clinicId");
  const date = sp.get("date");
  if (!clinicId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ slots: [] }, { status: 400 });
  const slots = await getSlots(clinicId, date, sp.get("serviceId"), sp.get("vetId"));
  return NextResponse.json({ slots });
}
