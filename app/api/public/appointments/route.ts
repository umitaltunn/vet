import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSlots } from "@/lib/slots";
import { normalizePhone } from "@/lib/phone";
import { sendMessage } from "@/lib/messaging";
import { fmtDateTime, trDate } from "@/lib/time";

export const dynamic = "force-dynamic";

// Basit kotuye kullanim korumasi: IP basina dakikada 8 talep
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 8;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin." }, { status: 429 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const s = (k: string, max = 200) => String(b[k] ?? "").trim().slice(0, max);
  const clinicId = s("clinicId");
  const serviceId = s("serviceId");
  const vetId = s("vetId") || null;
  const date = s("date");
  const time = s("time");
  const ownerName = s("ownerName", 80);
  const petName = s("petName", 60);
  const petSpecies = s("petSpecies", 30) || "Diğer";
  const note = s("note", 1000);
  const phone = normalizePhone(s("ownerPhone"));
  const h = s("h") || null;

  if (!b.kvkk) return NextResponse.json({ error: "KVKK onayı gerekli." }, { status: 400 });
  if (!ownerName || !petName) return NextResponse.json({ error: "Ad ve dostunuzun adı gerekli." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Telefon numarası geçersiz. 05xx xxx xx xx biçiminde yazın." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return NextResponse.json({ error: "Tarih/saat geçersiz." }, { status: 400 });

  const clinic = await db.clinic.findFirst({ where: { id: clinicId, active: true } });
  const service = await db.service.findFirst({ where: { id: serviceId, clinicId, bookable: true } });
  if (!clinic || !service) return NextResponse.json({ error: "Klinik ya da hizmet bulunamadı." }, { status: 404 });

  // Saat hala bos mu? (ayni anda iki kisi ayni saati secmis olabilir)
  const slots = await getSlots(clinicId, date, serviceId, vetId);
  const slot = slots.find((x) => x.time === time);
  if (!slot) return NextResponse.json({ error: "Üzgünüz, bu saat az önce doldu. Lütfen başka bir saat seçin." }, { status: 409 });
  const assignedVet = slot.vetIds[0] === "_" ? null : vetId && slot.vetIds.includes(vetId) ? vetId : slot.vetIds[0];

  // Sahip ve hayvani bul ya da olustur (telefon numarasi anahtar)
  let owner = await db.owner.findFirst({ where: { clinicId, phone } });
  if (!owner) owner = await db.owner.create({ data: { clinicId, name: ownerName, phone, kvkkConsent: true, consentAt: new Date() } });
  else if (!owner.kvkkConsent) owner = await db.owner.update({ where: { id: owner.id }, data: { kvkkConsent: true, consentAt: new Date() } });
  let pet = await db.pet.findFirst({ where: { ownerId: owner.id, name: petName } });
  if (!pet) pet = await db.pet.create({ data: { clinicId, ownerId: owner.id, name: petName, species: petSpecies } });

  let reminderId: string | null = null;
  if (h) {
    const r = await db.reminder.findFirst({ where: { token: h, clinicId } });
    if (r) {
      reminderId = r.id;
      await db.reminder.update({ where: { id: r.id }, data: { status: "RANDEVU_ALINDI" } });
    }
  }

  const startAt = trDate(date, time);
  const appt = await db.appointment.create({
    data: {
      clinicId,
      serviceId,
      vetId: assignedVet,
      ownerId: owner.id,
      petId: pet.id,
      startAt,
      endAt: new Date(startAt.getTime() + service.durationMin * 60000),
      status: "BEKLIYOR",
      source: reminderId ? "HATIRLATMA" : "ONLINE",
      ownerName,
      ownerPhone: phone,
      petName,
      petSpecies,
      note,
      reminderId,
    },
    include: { vet: true },
  });

  await sendMessage({
    clinicId,
    to: phone,
    toName: ownerName,
    kind: "TALEP",
    appointmentId: appt.id,
    body: `Merhaba ${ownerName}, ${petName} için ${fmtDateTime(startAt)} (${service.name}) randevu talebinizi aldık. Onaylandığında size haber vereceğiz.\n${clinic.name}`,
  });

  return NextResponse.json({ id: appt.id, vetName: appt.vet?.name ?? "" });
}
