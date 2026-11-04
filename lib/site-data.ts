import type { Clinic } from "@prisma/client";
import { parseHours } from "./clinic";
import { DAY_NAMES_TR, hm, todayKey, weekday, minutes } from "./time";

/** "Bugün 09:00–19:00 açık" / "Şu an açık" / "Bugün kapalı" */
export function todayText(clinic: Clinic): string {
  const hours = parseHours(clinic.workingHours);
  const t = todayKey();
  const ranges = hours[String(weekday(t))] ?? [];
  if (!ranges.length) {
    for (let i = 1; i <= 7; i++) {
      const d = (weekday(t) + i) % 7;
      const r = hours[String(d)];
      if (r?.length) return `Bugün kapalı · ${DAY_NAMES_TR[d]} ${r[0][0]}'da açılıyoruz`;
    }
    return "Bugün kapalı";
  }
  const now = minutes(hm(new Date()));
  const openNow = ranges.some(([a, b]) => now >= minutes(a) && now < minutes(b));
  const first = ranges[0][0];
  const last = ranges[ranges.length - 1][1];
  return openNow ? `Şu an açığız · ${first}–${last}` : `Bugün ${first}–${last} arası açık`;
}
