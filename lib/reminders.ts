import { db } from "./db";
import { sendMessage } from "./messaging";
import { publicSiteUrl } from "./clinic";
import { addDays, fmtDate, fmtDateTime, hm, todayKey, trDate } from "./time";

const VACCINE_WINDOW_DAYS = 14; // asi tarihinden 14 gun once hatirlat
const OVERDUE_DAYS = 30; // 30 gune kadar gecikmis asilari da yakala

/**
 * Hatirlatma motoru. Panel her acildiginda ve "Simdi calistir" ile cagrilir.
 * Ayni sey icin ikinci kez mesaj atmaz (her asi ve randevu icin tek hatirlatma).
 * Canlida bunu bir zamanlanmis gorev (cron) her sabah 09:00'da calistirir.
 */
export async function runReminders(clinicId: string) {
  const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return { vaccines: 0, appointments: 0 };
  const site = publicSiteUrl(clinic);
  const today = todayKey();
  let vaccines = 0;
  let appointments = 0;

  // 1) Yaklasan / gecikmis asilar
  const due = await db.vaccination.findMany({
    where: {
      clinicId,
      nextDueAt: { gte: trDate(addDays(today, -OVERDUE_DAYS)), lte: trDate(addDays(today, VACCINE_WINDOW_DAYS), "23:59") },
      reminders: { none: {} },
    },
    include: { pet: { include: { owner: true } } },
  });
  for (const v of due) {
    // Ayni asi daha sonra tekrar yapildiysa (daha yeni kayit varsa) hatirlatma gereksiz
    const newer = await db.vaccination.findFirst({ where: { petId: v.petId, name: v.name, givenAt: { gt: v.givenAt } } });
    if (newer) continue;
    const r = await db.reminder.create({ data: { clinicId, petId: v.petId, vaccinationId: v.id, type: "ASI", dueAt: v.nextDueAt! } });
    const link = `${site}/randevu?h=${r.token}`;
    const late = v.nextDueAt! < trDate(today);
    const body = late
      ? `Merhaba ${v.pet.owner.name}, ${v.pet.name} için ${v.name} aşısının zamanı ${fmtDate(v.nextDueAt)} tarihinde geçti. Sağlığı için en kısa zamanda bekliyoruz. Tek tıkla randevu: ${link}\n${clinic.name}`
      : `Merhaba ${v.pet.owner.name}, ${v.pet.name} için ${v.name} aşısının zamanı yaklaşıyor (${fmtDate(v.nextDueAt)}). Tek tıkla randevu alabilirsiniz: ${link}\n${clinic.name}`;
    await sendMessage({ clinicId, to: v.pet.owner.phone, toName: v.pet.owner.name, body, kind: "ASI", reminderId: r.id });
    vaccines++;
  }

  // 2) Yarinki onayli randevular
  const tomorrow = addDays(today, 1);
  const appts = await db.appointment.findMany({
    where: { clinicId, status: "ONAYLANDI", startAt: { gte: trDate(tomorrow), lte: trDate(tomorrow, "23:59") } },
    include: { service: true },
  });
  for (const a of appts) {
    const exists = await db.reminder.findFirst({ where: { clinicId, type: "RANDEVU", appointmentId: a.id } });
    if (exists) continue;
    const r = await db.reminder.create({ data: { clinicId, type: "RANDEVU", appointmentId: a.id, petId: a.petId, dueAt: a.startAt } });
    await sendMessage({
      clinicId,
      to: a.ownerPhone,
      toName: a.ownerName,
      kind: "RANDEVU",
      reminderId: r.id,
      appointmentId: a.id,
      body: `Hatırlatma: ${a.petName || "dostunuz"} için yarın saat ${hm(a.startAt)}'da ${a.service?.name ?? "randevunuz"} var. Gelemeyecekseniz lütfen bize haber verin: ${clinic.phone}\n${clinic.name}`,
    });
    appointments++;
  }

  return { vaccines, appointments };
}

/** Randevu tamamlaninca Google yorum istegi. */
export async function askReview(appointmentId: string) {
  const a = await db.appointment.findUnique({ where: { id: appointmentId }, include: { clinic: true } });
  if (!a || a.reviewAsked || !a.clinic.googleReviewUrl) return;
  await db.appointment.update({ where: { id: a.id }, data: { reviewAsked: true } });
  await sendMessage({
    clinicId: a.clinicId,
    to: a.ownerPhone,
    toName: a.ownerName,
    kind: "YORUM",
    appointmentId: a.id,
    body: `Bugün ${a.petName || "dostunuzla"} bizi ziyaret ettiğiniz için teşekkürler! Deneyiminizi 30 saniyede paylaşırsanız çok mutlu oluruz: ${a.clinic.googleReviewUrl}\n${a.clinic.name}`,
  });
}

export function appointmentText(a: { startAt: Date; petName: string }, clinicName: string, serviceName?: string) {
  return `${a.petName || "Dostunuz"} için ${fmtDateTime(a.startAt)} ${serviceName ? `(${serviceName}) ` : ""}randevunuz`;
}
