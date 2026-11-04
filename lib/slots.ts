import { db } from "./db";
import { parseHours } from "./clinic";
import { fromMinutes, minutes, trDate, weekday } from "./time";

export type Slot = { time: string; vetIds: string[] };

/**
 * Bir gun icin bos randevu saatlerini hesaplar.
 * - Klinigin calisma saatleri ve slot uzunlugu kullanilir.
 * - Hizmet suresi kadar bos zaman olan hekimler listelenir.
 * - Gecmis saatler ve iptal olmayan randevularla cakisanlar elenir.
 */
export async function getSlots(clinicId: string, day: string, serviceId?: string | null, vetId?: string | null): Promise<Slot[]> {
  const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return [];
  const service = serviceId ? await db.service.findFirst({ where: { id: serviceId, clinicId } }) : null;
  const duration = service?.durationMin ?? clinic.slotMinutes;
  const vets = await db.vet.findMany({ where: { clinicId, bookable: true, ...(vetId ? { id: vetId } : {}) }, orderBy: { order: "asc" } });
  const vetIds = vets.length ? vets.map((v) => v.id) : ["_"]; // hekim tanimli degilse tek kanal

  const ranges = parseHours(clinic.workingHours)[String(weekday(day))] ?? [];
  if (!ranges.length) return [];

  const dayStart = trDate(day, "00:00");
  const dayEnd = trDate(day, "23:59");
  const appts = await db.appointment.findMany({
    where: { clinicId, status: { notIn: ["IPTAL"] }, startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
    select: { startAt: true, endAt: true, vetId: true },
  });

  const now = Date.now() + 30 * 60 * 1000; // en erken 30 dk sonrasi
  const out: Slot[] = [];
  for (const [open, close] of ranges) {
    for (let t = minutes(open); t + duration <= minutes(close); t += clinic.slotMinutes) {
      const s = trDate(day, fromMinutes(t));
      const e = new Date(s.getTime() + duration * 60000);
      if (s.getTime() < now) continue;
      const free = vetIds.filter((vid) =>
        !appts.some((a) => (vid === "_" || a.vetId === vid || a.vetId === null) && a.startAt < e && a.endAt > s),
      );
      if (free.length) out.push({ time: fromMinutes(t), vetIds: free });
    }
  }
  return out;
}
