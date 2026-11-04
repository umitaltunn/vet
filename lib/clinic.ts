import { cache } from "react";
import { headers } from "next/headers";
import type { Clinic } from "@prisma/client";
import { db } from "./db";

export type Hours = Record<string, [string, string][]>;

export const DEFAULT_HOURS: Hours = {
  "0": [],
  "1": [["09:00", "12:30"], ["13:30", "19:00"]],
  "2": [["09:00", "12:30"], ["13:30", "19:00"]],
  "3": [["09:00", "12:30"], ["13:30", "19:00"]],
  "4": [["09:00", "12:30"], ["13:30", "19:00"]],
  "5": [["09:00", "12:30"], ["13:30", "19:00"]],
  "6": [["10:00", "16:00"]],
};

export function parseHours(json: string): Hours {
  try {
    const h = JSON.parse(json) as Hours;
    if (h && typeof h === "object") return h;
  } catch {}
  return DEFAULT_HOURS;
}

/** Slug ya da alan adina gore klinigi bulur (istek basina bir kez). */
export const getClinicByKey = cache(async (key: string) => {
  const k = decodeURIComponent(key).toLowerCase();
  return db.clinic.findFirst({
    where: { active: true, OR: [{ slug: k }, { domain: k }, { domain: k.replace(/^www\./, "") }] },
  });
});

/** Klinik sitesindeki linklerin oneki: alan adiyla gelindiyse "", aksi halde /k/slug */
export async function siteBase(clinic: Clinic): Promise<string> {
  const h = await headers();
  return h.get("x-site-mode") === "host" ? "" : `/k/${clinic.slug}`;
}

/** Klinigin herkese acik site adresi (mesajlardaki linkler icin) */
export function publicSiteUrl(clinic: Pick<Clinic, "slug" | "domain">): string {
  const base = process.env.PUBLIC_URL || "http://localhost:3000";
  if (clinic.domain) return `https://${clinic.domain}`;
  return `${base.replace(/\/$/, "")}/k/${clinic.slug}`;
}

export function subdomainUrl(slug: string): string {
  const root = process.env.ROOT_DOMAIN || "localhost";
  const base = new URL(process.env.PUBLIC_URL || "http://localhost:3000");
  return `${base.protocol}//${slug}.${root}${base.port ? ":" + base.port : ""}`;
}

/** Hex rengi rgb ucluye cevirir: "#247C86" -> "36 124 134" */
export function rgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  const n = parseInt(full.slice(0, 6), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function themeVars(c: Pick<Clinic, "primaryColor" | "accentColor" | "bgColor" | "darkColor" | "goldColor">): React.CSSProperties {
  return {
    ["--primary" as string]: c.primaryColor,
    ["--accent" as string]: c.accentColor,
    ["--bg" as string]: c.bgColor,
    ["--dark" as string]: c.darkColor,
    ["--gold" as string]: c.goldColor,
    ["--primary-rgb" as string]: rgb(c.primaryColor),
    ["--accent-rgb" as string]: rgb(c.accentColor),
    ["--dark-rgb" as string]: rgb(c.darkColor),
    ["--gold-rgb" as string]: rgb(c.goldColor),
  };
}

export const THEMES = [
  { id: "sicak", name: "Sıcak", desc: "Yuvarlak hatlar, pastel tonlar. Aile kliniği samimiyeti." },
  { id: "modern", name: "Modern", desc: "Keskin, ferah, hastane ciddiyeti. Rakamlar ve güven." },
  { id: "egzotik", name: "Egzotik", desc: "Koyu zemin, yapraklar, kuş ve sürüngen klinikleri için." },
] as const;

export const PAW_TYPES = [
  { id: "karisik", name: "Kedi + köpek" },
  { id: "kedi", name: "Kedi patisi" },
  { id: "kopek", name: "Köpek patisi" },
  { id: "kus", name: "Kuş ayağı" },
] as const;
