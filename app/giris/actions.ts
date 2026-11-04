"use server";
import { redirect } from "next/navigation";
import { login, logout, getSession } from "@/lib/auth";

export async function loginAction(_prev: string | null, fd: FormData): Promise<string | null> {
  const ok = await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
  if (!ok) return "E-posta ya da şifre hatalı.";
  const s = await getSession();
  redirect(s?.user.role === "SUPERADMIN" ? "/admin" : "/panel");
}

export async function logoutAction() {
  await logout();
  redirect("/giris");
}
