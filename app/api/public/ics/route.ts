import { type NextRequest } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Randevuyu telefon takvimine eklemek icin .ics dosyasi */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const a = await db.appointment.findUnique({ where: { id }, include: { clinic: true, service: true } });
  if (!a) return new Response("Bulunamadı", { status: 404 });
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PatiPanel//TR",
    "BEGIN:VEVENT",
    `UID:${a.id}@patipanel`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(a.startAt)}`,
    `DTEND:${stamp(a.endAt)}`,
    `SUMMARY:${a.petName} - ${a.service?.name ?? "Veteriner randevusu"} (${a.clinic.name})`,
    `LOCATION:${[a.clinic.address, a.clinic.city].filter(Boolean).join(", ")}`,
    `DESCRIPTION:Telefon: ${a.clinic.phone}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Veteriner randevusu",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="randevu.ics"` } });
}
