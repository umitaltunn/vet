import Link from "next/link";
import { ExternalLink, LogIn, LogOut } from "lucide-react";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { subdomainUrl, themeVars } from "@/lib/clinic";
import { SubmitButton } from "@/components/panel/Buttons";
import { Paw } from "@/components/fx/Paw";
import { enterClinic, updateClinic } from "./actions";
import { CreateClinicForm } from "./CreateClinicForm";
import { logoutAction } from "../giris/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Platform Yönetimi · PatiPanel" };

const PRICE: Record<string, number> = { VITRIN: 990, KLINIK: 1990, PRO: 3490 };

export default async function Admin() {
  await requireSuperAdmin();
  const clinics = await db.clinic.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { pets: true, appointments: true, messages: true } } },
  });
  const mrr = clinics.filter((c) => c.active).reduce((s, c) => s + (PRICE[c.plan] ?? 0), 0);
  return (
    <div className="panel" style={themeVars({ primaryColor: "#247C86", accentColor: "#F06F62", bgColor: "#F6F7FB", darkColor: "#1F2235", goldColor: "#C7A77A" })}>
      <main className="pn-main admin-main">
        <header className="pn-head">
          <div className="pf-brand"><span className="pf-logo"><Paw kind="kedi" size={20} /></span> PatiPanel · Platform Yönetimi</div>
          <form action={logoutAction}><button className="btn btn-ghost"><LogOut size={16} /> Çıkış</button></form>
        </header>
        <div className="kpis">
          <div className="kpi"><strong>{clinics.length}</strong><span>Klinik</span></div>
          <div className="kpi"><strong>{clinics.reduce((s, c) => s + c._count.pets, 0)}</strong><span>Kayıtlı hasta</span></div>
          <div className="kpi"><strong>{clinics.reduce((s, c) => s + c._count.appointments, 0)}</strong><span>Randevu</span></div>
          <div className="kpi kpi-hero"><strong>{mrr.toLocaleString("tr-TR")} TL</strong><span>Aylık tekrarlayan gelir (örnek fiyatlarla)</span></div>
        </div>

        <section className="pn-card">
          <h2>Klinikler</h2>
          <p className="muted">Hepsi aynı kod ve aynı veritabanında çalışır. Yeni klinik için sunucu kurmanız gerekmez.</p>
          <div className="clinic-list">
            {clinics.map((c) => (
              <div key={c.id} className="clinic-row" style={{ ["--cc" as string]: c.primaryColor }}>
                <div className="cr-brand">
                  {c.logoUrl ? <img src={c.logoUrl} alt="" /> : <span className="cr-dot" />}
                  <div>
                    <strong>{c.name}</strong>
                    <small className="block muted">{c.city} · tema: {c.theme} · {c._count.pets} hasta · {c._count.appointments} randevu</small>
                    <small className="block">
                      <a href={`/k/${c.slug}`} target="_blank">/k/{c.slug}</a> · <a href={subdomainUrl(c.slug)} target="_blank">{subdomainUrl(c.slug).replace(/^https?:\/\//, "")}</a>
                    </small>
                  </div>
                </div>
                <form action={updateClinic.bind(null, c.id)} className="cr-form">
                  <label>Alan adı<input name="domain" defaultValue={c.domain ?? ""} placeholder="klinikadi.com" /></label>
                  <label>Paket<select name="plan" defaultValue={c.plan}><option>VITRIN</option><option>KLINIK</option><option>PRO</option></select></label>
                  <label className="check"><input type="checkbox" name="active" defaultChecked={c.active} /> <span>Yayında</span></label>
                  <SubmitButton className="btn btn-sm btn-ghost">Kaydet</SubmitButton>
                </form>
                <div className="row-actions">
                  <a className="btn btn-sm btn-ghost" href={`/k/${c.slug}`} target="_blank"><ExternalLink size={14} /> Site</a>
                  <form action={enterClinic.bind(null, c.id)}><SubmitButton className="btn btn-sm btn-primary"><LogIn size={14} /> Paneline gir</SubmitButton></form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pn-card">
          <h2>Yeni klinik ekle</h2>
          <p className="muted">Kaydettiğiniz an site <code>/k/adres</code> ve <code>adres.localhost:3000</code> üzerinde yayında olur. Kendi alan adını sonra yukarıdan bağlarsınız.</p>
          <CreateClinicForm />
        </section>

        <section className="pn-card">
          <h2>Alan adı nasıl bağlanır?</h2>
          <ol className="steps">
            <li>Kliniğin alan adını yukarıdaki &quot;Alan adı&quot; alanına yazıp kaydedin (ör. <code>patidostu.com</code>).</li>
            <li>Canlı sunucuda (Vercel) Proje → Settings → Domains bölümüne aynı alan adını ekleyin.</li>
            <li>Kliniğin alan adı panelinde (Natro, GoDaddy vb.) Vercel&apos;in verdiği <code>A</code> / <code>CNAME</code> kaydını girin.</li>
            <li>Birkaç dakika içinde site o adreste, https ile açılır. Kod tarafında hiçbir şey değişmez.</li>
          </ol>
          <p className="muted">Yerelde denemek için: <Link href="/k/patidostu">localhost:3000/k/patidostu</Link> ya da <a href="http://patidostu.localhost:3000">patidostu.localhost:3000</a></p>
        </section>
      </main>
    </div>
  );
}
