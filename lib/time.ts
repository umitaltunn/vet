// Turkiye 2016'dan beri sabit UTC+3 kullanir (yaz saati yok).
// Tum hesaplar sunucunun saat diliminden bagimsiz olsun diye bu sabit kullanilir.
export const TZ = "Europe/Istanbul";
const OFFSET_MS = 3 * 60 * 60 * 1000;

/** Date -> Istanbul'a gore "YYYY-MM-DD" */
export function dayKey(d: Date): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** Date -> Istanbul'a gore "HH:MM" */
export function hm(d: Date): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(11, 16);
}

/** "YYYY-MM-DD" + "HH:MM" (Istanbul) -> Date */
export function trDate(day: string, time = "00:00"): Date {
  return new Date(`${day}T${time}:00+03:00`);
}

/** "YYYY-MM-DD" icin haftanin gunu (0=Pazar) */
export function weekday(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function todayKey(): string {
  return dayKey(new Date());
}

export function minutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(n: number): string {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

export function fmtDate(d: Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!d) return "-";
  return new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", year: "numeric", ...opts }).format(d);
}

export function fmtShort(d: Date | null | undefined): string {
  if (!d) return "-";
  return new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function fmtDateTime(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function fmtDayLabel(day: string): string {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long" }).format(trDate(day, "12:00"));
}

export const DAY_NAMES = ["Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"];
export const DAY_NAMES_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export function ageText(birth: Date | null | undefined): string {
  if (!birth) return "";
  const months = Math.floor((Date.now() - birth.getTime()) / (30.44 * 24 * 3600 * 1000));
  if (months < 1) return "yeni doğmuş";
  if (months < 12) return `${months} aylık`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} yaş ${m} ay` : `${y} yaş`;
}
