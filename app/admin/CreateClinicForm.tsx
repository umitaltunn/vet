"use client";
import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { createClinic } from "./actions";
import { pawBurst } from "@/components/fx/burst";

export function CreateClinicForm() {
  const [msg, action, pending] = useActionState(async (p: string | null, fd: FormData) => {
    const r = await createClinic(p, fd);
    if (r?.startsWith("OK:")) pawBurst(window.innerWidth / 2, window.innerHeight / 2, { count: 50, hearts: true });
    return r;
  }, null);
  const ok = msg?.startsWith("OK:");
  return (
    <form action={action} className="form-grid">
      <label>Klinik adı<input name="name" required placeholder="Minik Patiler Veteriner Kliniği" /></label>
      <label>Site adresi (küçük harf, tire)<input name="slug" required placeholder="minikpatiler" pattern="[a-z0-9\-]+" /></label>
      <label>Şehir<input name="city" placeholder="Bursa" /></label>
      <label>Telefon<input name="phone" placeholder="0224 ..." /></label>
      <label>Hekim adı<input name="vetName" placeholder="Dr. Ad Soyad" /></label>
      <label>Tema<select name="theme"><option value="sicak">Sıcak</option><option value="modern">Modern</option><option value="egzotik">Egzotik</option></select></label>
      <label>Paket<select name="plan" defaultValue="KLINIK"><option>VITRIN</option><option>KLINIK</option><option>PRO</option></select></label>
      <label>Panel e-postası<input name="email" type="email" required /></label>
      <label>Panel şifresi<input name="password" type="text" required minLength={6} placeholder="en az 6 karakter" /></label>
      {msg && !ok && <p className="form-error full">{msg}</p>}
      {ok && <p className="form-ok full">Klinik oluşturuldu! Site yayında: <a href={`/k/${msg!.slice(3)}`} target="_blank">/k/{msg!.slice(3)}</a></p>}
      <div className="full"><button className="btn btn-primary" disabled={pending}>{pending ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} Kliniği oluştur</button></div>
    </form>
  );
}
