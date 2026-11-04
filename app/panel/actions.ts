"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { sendMessage } from "@/lib/messaging";
import { askReview, runReminders } from "@/lib/reminders";
import { normalizePhone } from "@/lib/phone";
import { saveUpload } from "@/lib/upload";
import { addDays, fmtDateTime, trDate } from "@/lib/time";
import { VACCINES } from "@/lib/vaccines";

const str = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

// ---------------- Hatirlatmalar ----------------
export async function runRemindersAction() {
  const { clinicId } = await requireClinicUser();
  await runReminders(clinicId);
  revalidatePath("/panel", "layout");
}

export async function setReminderStatus(id: string, status: string) {
  const { clinicId } = await requireClinicUser();
  await db.reminder.updateMany({ where: { id, clinicId }, data: { status } });
  revalidatePath("/panel/hatirlatmalar");
}

// ---------------- Randevular ----------------
export async function setAppointmentStatus(id: string, status: string) {
  const { clinicId, clinic } = await requireClinicUser();
  const a = await db.appointment.findFirst({ where: { id, clinicId }, include: { service: true } });
  if (!a) return;
  await db.appointment.update({ where: { id }, data: { status } });
  if (status === "ONAYLANDI" && a.status !== "ONAYLANDI") {
    await sendMessage({
      clinicId, to: a.ownerPhone, toName: a.ownerName, kind: "ONAY", appointmentId: a.id,
      body: `Merhaba ${a.ownerName}, ${a.petName} için ${fmtDateTime(a.startAt)} randevunuz onaylandı. Adres: ${clinic.address}. Görüşmek üzere!\n${clinic.name}`,
    });
  }
  if (status === "IPTAL" && a.status !== "IPTAL") {
    await sendMessage({
      clinicId, to: a.ownerPhone, toName: a.ownerName, kind: "BILGI", appointmentId: a.id,
      body: `Merhaba ${a.ownerName}, ${fmtDateTime(a.startAt)} tarihli randevunuz iptal edildi. Yeni bir saat için bize ulaşabilirsiniz: ${clinic.phone}\n${clinic.name}`,
    });
  }
  if (status === "TAMAMLANDI") await askReview(a.id);
  revalidatePath("/panel", "layout");
}

export async function createAppointment(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const petId = str(fd, "petId");
  const serviceId = str(fd, "serviceId") || null;
  const vetId = str(fd, "vetId") || null;
  const date = str(fd, "date");
  const time = str(fd, "time");
  const note = str(fd, "note", 1000);
  const pet = await db.pet.findFirst({ where: { id: petId, clinicId }, include: { owner: true } });
  if (!pet || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error("Hasta, tarih ve saat seçmelisiniz.");
  const service = serviceId ? await db.service.findFirst({ where: { id: serviceId, clinicId } }) : null;
  const startAt = trDate(date, time);
  await db.appointment.create({
    data: {
      clinicId, serviceId: service?.id ?? null, vetId, petId: pet.id, ownerId: pet.ownerId, startAt,
      endAt: new Date(startAt.getTime() + (service?.durationMin ?? 30) * 60000),
      status: "ONAYLANDI", source: "PANEL", ownerName: pet.owner.name, ownerPhone: pet.owner.phone, petName: pet.name, petSpecies: pet.species, note,
    },
  });
  revalidatePath("/panel", "layout");
  redirect(`/panel/randevular?tarih=${date}`);
}

// ---------------- Hastalar ----------------
export async function createPatient(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const phone = normalizePhone(str(fd, "phone"));
  if (!phone) throw new Error("Telefon numarası geçersiz.");
  const ownerName = str(fd, "ownerName", 80);
  let owner = await db.owner.findFirst({ where: { clinicId, phone } });
  if (!owner) {
    const consent = bool(fd, "kvkk");
    owner = await db.owner.create({ data: { clinicId, name: ownerName, phone, email: str(fd, "email"), kvkkConsent: consent, consentAt: consent ? new Date() : null } });
  }
  const birth = str(fd, "birthDate");
  const pet = await db.pet.create({
    data: {
      clinicId, ownerId: owner.id, name: str(fd, "petName", 60), species: str(fd, "species") || "Kedi", breed: str(fd, "breed"), sex: str(fd, "sex"),
      birthDate: birth ? trDate(birth, "12:00") : null, chipNo: str(fd, "chipNo"), color: str(fd, "color"),
    },
  });
  revalidatePath("/panel/hastalar");
  redirect(`/panel/hastalar/${pet.id}`);
}

export async function updatePet(id: string, fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const pet = await db.pet.findFirst({ where: { id, clinicId } });
  if (!pet) return;
  const birth = str(fd, "birthDate");
  await db.pet.update({
    where: { id },
    data: {
      name: str(fd, "name", 60), species: str(fd, "species"), breed: str(fd, "breed"), sex: str(fd, "sex"), color: str(fd, "color"),
      chipNo: str(fd, "chipNo"), neutered: bool(fd, "neutered"), notes: str(fd, "notes", 3000), birthDate: birth ? trDate(birth, "12:00") : null,
    },
  });
  const phone = normalizePhone(str(fd, "ownerPhone"));
  await db.owner.update({ where: { id: pet.ownerId }, data: { name: str(fd, "ownerName", 80), email: str(fd, "ownerEmail"), ...(phone ? { phone } : {}) } });
  revalidatePath(`/panel/hastalar/${id}`);
}

export async function deletePet(id: string) {
  const { clinicId } = await requireClinicUser();
  await db.pet.deleteMany({ where: { id, clinicId } });
  revalidatePath("/panel/hastalar");
  redirect("/panel/hastalar");
}

export async function addVaccination(petId: string, fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const pet = await db.pet.findFirst({ where: { id: petId, clinicId } });
  if (!pet) return;
  const name = str(fd, "name", 80) || str(fd, "customName", 80);
  const given = str(fd, "givenAt");
  if (!name || !given) throw new Error("Aşı adı ve tarihi gerekli.");
  const preset = VACCINES.find((v) => v.name === name);
  const days = Number(str(fd, "intervalDays") || preset?.days || 0);
  await db.vaccination.create({
    data: {
      clinicId, petId, name, givenAt: trDate(given, "12:00"), nextDueAt: days > 0 ? trDate(addDays(given, days), "12:00") : null,
      vetName: str(fd, "vetName"), notes: str(fd, "notes"),
    },
  });
  revalidatePath(`/panel/hastalar/${petId}`);
}

export async function deleteVaccination(id: string, petId: string) {
  const { clinicId } = await requireClinicUser();
  await db.vaccination.deleteMany({ where: { id, clinicId } });
  revalidatePath(`/panel/hastalar/${petId}`);
}

// ---------------- Site ayarlari ----------------
export async function updateSite(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const logo = await saveUpload(fd.get("logo") as File | null, clinicId);
  const color = (k: string, d: string) => (/^#[0-9a-fA-F]{6}$/.test(str(fd, k)) ? str(fd, k) : d);
  const c = await db.clinic.findUnique({ where: { id: clinicId } });
  if (!c) return;
  await db.clinic.update({
    where: { id: clinicId },
    data: {
      name: str(fd, "name", 120) || c.name,
      tagline: str(fd, "tagline", 160), heroTitle: str(fd, "heroTitle", 160), heroSubtitle: str(fd, "heroSubtitle", 400), about: str(fd, "about", 3000),
      theme: ["sicak", "modern", "egzotik"].includes(str(fd, "theme")) ? str(fd, "theme") : c.theme,
      pawType: ["karisik", "kedi", "kopek", "kus"].includes(str(fd, "pawType")) ? str(fd, "pawType") : c.pawType,
      animationLevel: ["sakin", "normal", "coskulu"].includes(str(fd, "animationLevel")) ? str(fd, "animationLevel") : c.animationLevel,
      cursorTrail: bool(fd, "cursorTrail"),
      primaryColor: color("primaryColor", c.primaryColor), accentColor: color("accentColor", c.accentColor), bgColor: color("bgColor", c.bgColor),
      darkColor: color("darkColor", c.darkColor), goldColor: color("goldColor", c.goldColor),
      phone: str(fd, "phone"), whatsapp: str(fd, "whatsapp"), email: str(fd, "email"), address: str(fd, "address"), city: str(fd, "city"),
      mapQuery: str(fd, "mapQuery"), emergencyPhone: str(fd, "emergencyPhone"), instagram: str(fd, "instagram").replace(/^@/, ""), googleReviewUrl: str(fd, "googleReviewUrl"),
      ...(logo ? { logoUrl: logo } : {}),
      ...(bool(fd, "removeLogo") ? { logoUrl: null } : {}),
    },
  });
  revalidatePath("/", "layout");
}

export async function updateHours(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const hours: Record<string, [string, string][]> = {};
  const ok = (t: string) => /^\d{2}:\d{2}$/.test(t);
  for (let d = 0; d < 7; d++) {
    const ranges: [string, string][] = [];
    if (bool(fd, `open-${d}`)) {
      for (const k of [1, 2]) {
        const a = str(fd, `a${k}-${d}`), b = str(fd, `b${k}-${d}`);
        if (ok(a) && ok(b) && a < b) ranges.push([a, b]);
      }
    }
    hours[String(d)] = ranges;
  }
  const slot = Math.min(120, Math.max(10, Number(str(fd, "slotMinutes")) || 30));
  await db.clinic.update({ where: { id: clinicId }, data: { workingHours: JSON.stringify(hours), slotMinutes: slot } });
  revalidatePath("/", "layout");
}

// ---------------- Hizmetler ----------------
export async function saveService(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const id = str(fd, "id");
  const data = {
    name: str(fd, "name", 80), description: str(fd, "description", 400), icon: str(fd, "icon") || "stethoscope",
    durationMin: Math.max(5, Number(str(fd, "durationMin")) || 30), priceText: str(fd, "priceText", 60), bookable: bool(fd, "bookable"),
    order: Number(str(fd, "order")) || 0,
  };
  if (!data.name) throw new Error("Hizmet adı gerekli.");
  if (id) await db.service.updateMany({ where: { id, clinicId }, data });
  else await db.service.create({ data: { ...data, clinicId } });
  revalidatePath("/", "layout");
}

export async function deleteService(id: string) {
  const { clinicId } = await requireClinicUser();
  await db.service.deleteMany({ where: { id, clinicId } });
  revalidatePath("/", "layout");
}

// ---------------- Ekip ----------------
export async function saveVet(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const id = str(fd, "id");
  const photo = await saveUpload(fd.get("photo") as File | null, clinicId);
  const data = {
    name: str(fd, "name", 80), title: str(fd, "title", 80), bio: str(fd, "bio", 1000), bookable: bool(fd, "bookable"), order: Number(str(fd, "order")) || 0,
    ...(photo ? { photoUrl: photo } : {}),
  };
  if (!data.name) throw new Error("Hekim adı gerekli.");
  if (id) await db.vet.updateMany({ where: { id, clinicId }, data });
  else await db.vet.create({ data: { ...data, clinicId } });
  revalidatePath("/", "layout");
}

export async function deleteVet(id: string) {
  const { clinicId } = await requireClinicUser();
  await db.vet.deleteMany({ where: { id, clinicId } });
  revalidatePath("/", "layout");
}

// ---------------- Galeri ve yorumlar ----------------
export async function addGalleryImage(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const url = await saveUpload(fd.get("image") as File | null, clinicId);
  if (!url) throw new Error("Bir görsel seçin.");
  await db.galleryImage.create({ data: { clinicId, url, caption: str(fd, "caption", 120) } });
  revalidatePath("/", "layout");
}

export async function deleteGalleryImage(id: string) {
  const { clinicId } = await requireClinicUser();
  await db.galleryImage.deleteMany({ where: { id, clinicId } });
  revalidatePath("/", "layout");
}

export async function saveTestimonial(fd: FormData) {
  const { clinicId } = await requireClinicUser();
  const text = str(fd, "text", 600);
  const author = str(fd, "author", 60);
  if (!text || !author) throw new Error("Yorum ve isim gerekli.");
  await db.testimonial.create({ data: { clinicId, author, petName: str(fd, "petName", 60), text, rating: Math.min(5, Math.max(1, Number(str(fd, "rating")) || 5)) } });
  revalidatePath("/", "layout");
}

export async function deleteTestimonial(id: string) {
  const { clinicId } = await requireClinicUser();
  await db.testimonial.deleteMany({ where: { id, clinicId } });
  revalidatePath("/", "layout");
}
