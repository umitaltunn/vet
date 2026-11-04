"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, requireSuperAdmin } from "@/lib/auth";
import { DEFAULT_HOURS } from "@/lib/clinic";

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const RESERVED = new Set(["www", "admin", "panel", "api", "app", "k", "giris"]);

const STARTER_SERVICES = [
  ["Genel Muayene", "Baştan kuyruğa kontrol ve danışmanlık.", "stethoscope", 30],
  ["Aşı Uygulaması", "Koruyucu aşılar ve dijital aşı karnesi.", "syringe", 20],
  ["Kısırlaştırma", "Güvenli anestezi ile operasyon.", "scissors", 90],
  ["Pet Kuaför", "Yıkama, tıraş, tırnak bakımı.", "sparkles", 60],
] as const;

/** Yeni klinik: tek tikla site + panel + varsayilan hizmetler. Sunucu/hosting gerekmez. */
export async function createClinic(_prev: string | null, fd: FormData): Promise<string | null> {
  await requireSuperAdmin();
  const name = str(fd, "name", 120);
  const slug = str(fd, "slug", 40).toLowerCase().replace(/[^a-z0-9-]/g, "");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (!name || !slug || !email || password.length < 6) return "Ad, adres, e-posta ve en az 6 karakterli şifre gerekli.";
  if (RESERVED.has(slug)) return "Bu adres ayrılmış, başka bir tane seçin.";
  if (await db.clinic.findUnique({ where: { slug } })) return "Bu adres zaten kullanılıyor.";
  if (await db.user.findUnique({ where: { email } })) return "Bu e-posta ile bir kullanıcı zaten var.";
  const theme = ["sicak", "modern", "egzotik"].includes(str(fd, "theme")) ? str(fd, "theme") : "sicak";
  const presets: Record<string, { primaryColor: string; accentColor: string; bgColor: string; darkColor: string; goldColor: string }> = {
    sicak: { primaryColor: "#247C86", accentColor: "#F06F62", bgColor: "#F6F3EC", darkColor: "#292B3D", goldColor: "#C7A77A" },
    modern: { primaryColor: "#1E3A8A", accentColor: "#0EA5E9", bgColor: "#F8FAFC", darkColor: "#0F172A", goldColor: "#94A3B8" },
    egzotik: { primaryColor: "#10B981", accentColor: "#FBBF24", bgColor: "#0B1F1A", darkColor: "#ECFDF5", goldColor: "#34D399" },
  };
  const clinic = await db.clinic.create({
    data: {
      name, slug, theme, ...presets[theme], city: str(fd, "city"), phone: str(fd, "phone"), whatsapp: str(fd, "phone"),
      heroSubtitle: `${name} olarak patili dostlarınız için buradayız. Online randevunuzu hemen alın.`,
      about: `${name}, sevgi ve bilimi bir araya getiren bir veteriner kliniğidir.`,
      workingHours: JSON.stringify(DEFAULT_HOURS), plan: str(fd, "plan") || "KLINIK",
      services: { create: STARTER_SERVICES.map(([n, d, i, m], order) => ({ name: n, description: d, icon: i, durationMin: m, order })) },
      vets: { create: [{ name: str(fd, "vetName") || "Dr. Hekim", title: "Veteriner Hekim" }] },
    },
  });
  await db.user.create({ data: { email, name: str(fd, "vetName") || name, role: "CLINIC_ADMIN", clinicId: clinic.id, passwordHash: await hashPassword(password) } });
  revalidatePath("/admin");
  return `OK:${clinic.slug}`;
}

export async function updateClinic(id: string, fd: FormData) {
  await requireSuperAdmin();
  const domain = str(fd, "domain").toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "") || null;
  if (domain && (await db.clinic.findFirst({ where: { domain, NOT: { id } } }))) throw new Error("Bu alan adı başka bir klinikte kayıtlı.");
  await db.clinic.update({ where: { id }, data: { domain, active: fd.get("active") === "on", plan: str(fd, "plan") || "KLINIK" } });
  revalidatePath("/admin");
}

/** Super admin bir klinigin paneline o klinik gibi girer (destek icin). */
export async function enterClinic(id: string) {
  const s = await requireSuperAdmin();
  await db.session.update({ where: { id: s.id }, data: { actingClinicId: id } });
  redirect("/panel");
}
