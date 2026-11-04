import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE = "pp_session";
const DAYS = 14;

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function login(email: string, password: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DAYS * 24 * 3600 * 1000);
  await db.session.create({ data: { id, userId: user.id, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt, secure: process.env.NODE_ENV === "production" && process.env.PUBLIC_URL?.startsWith("https") });
  return true;
}

export async function logout() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.session.deleteMany({ where: { id } });
  jar.delete(COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  const s = await db.session.findUnique({ where: { id }, include: { user: true } });
  if (!s || s.expiresAt < new Date()) return null;
  return s;
}

/** Panel icin: giris yapmis kullanici + calistigi klinik. */
export async function requireClinicUser() {
  const s = await getSession();
  if (!s) redirect("/giris");
  const clinicId = s.user.role === "SUPERADMIN" ? s.actingClinicId : s.user.clinicId;
  if (!clinicId) redirect(s.user.role === "SUPERADMIN" ? "/admin" : "/giris");
  const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) redirect("/giris");
  return { session: s, user: s.user, clinic, clinicId: clinic.id };
}

export async function requireSuperAdmin() {
  const s = await getSession();
  if (!s) redirect("/giris");
  if (s.user.role !== "SUPERADMIN") redirect("/panel");
  return s;
}
