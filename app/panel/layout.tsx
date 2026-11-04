import Link from "next/link";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { requireClinicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { themeVars } from "@/lib/clinic";
import { PanelNav } from "@/components/panel/Nav";
import { Paw } from "@/components/fx/Paw";
import { logoutAction } from "../giris/actions";

export const metadata = { title: "Panel · PatiPanel" };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, clinic } = await requireClinicUser();
  const pending = await db.appointment.count({ where: { clinicId: clinic.id, status: "BEKLIYOR", startAt: { gte: new Date() } } });
  return (
    <div className="panel" style={themeVars({ ...clinic, bgColor: "#F6F7FB", darkColor: "#1F2235" })}>
      <aside className="pn-side">
        <Link href="/panel" className="pn-brand">
          {clinic.logoUrl ? <img src={clinic.logoUrl} alt="" /> : <span className="pn-brand-paw"><Paw kind="kedi" size={20} /></span>}
          <div>
            <strong>{clinic.name}</strong>
            <small>PatiPanel · {clinic.plan}</small>
          </div>
        </Link>
        <PanelNav pending={pending} />
        <div className="pn-foot">
          <a href={`/k/${clinic.slug}`} target="_blank" className="pn-link"><ExternalLink size={18} /> <span>Siteyi görüntüle</span></a>
          {user.role === "SUPERADMIN" && <Link href="/admin" className="pn-link"><ShieldCheck size={18} /> <span>Platform yönetimi</span></Link>}
          <form action={logoutAction}>
            <button className="pn-link"><LogOut size={18} /> <span>Çıkış ({user.name.split(" ")[0]})</span></button>
          </form>
        </div>
      </aside>
      <main className="pn-main">{children}</main>
    </div>
  );
}
