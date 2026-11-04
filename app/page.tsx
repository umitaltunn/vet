import Link from "next/link";
import { ArrowRight, BellRing, CalendarHeart, Check, Globe, LayoutDashboard, MessageCircle, QrCode, Sparkles, Star } from "lucide-react";
import { db } from "@/lib/db";
import { FloatingPaws, HeroWords, Reveal } from "@/components/fx/Motion";
import { Paw } from "@/components/fx/Paw";
import { PlatformWalk } from "@/components/site/PlatformWalk";

export const dynamic = "force-dynamic";

export default async function PlatformHome() {
  const clinics = await db.clinic.findMany({ where: { active: true }, orderBy: { createdAt: "asc" }, take: 6 });
  const features = [
    { icon: Globe, t: "Kliniğe özel web sitesi", d: "3 tema, kendi logonuz ve renkleriniz, pati animasyonlu sayfa geçişleri. 1 günde yayında." },
    { icon: CalendarHeart, t: "7/24 online randevu", d: "Hasta sahibi telefonla aramadan boş saati seçer. Siz panelden tek tıkla onaylarsınız." },
    { icon: BellRing, t: "Otomatik aşı hatırlatma", d: "Aşı tarihi yaklaşınca WhatsApp'tan mesaj gider, içindeki linkle tek tıkla randevu alınır." },
    { icon: QrCode, t: "Dijital aşı karnesi", d: "Her hayvana QR kodlu karne. Kağıt karne kaybolmaz, sahibi her an görür." },
    { icon: Star, t: "Google yorum toplama", d: "Muayene tamamlanınca sahibine yorum isteği gider. Haritalarda üst sıralara çıkın." },
    { icon: LayoutDashboard, t: "Sade klinik paneli", d: "Bugünün randevuları, onay bekleyenler, yaklaşan aşılar ve hatırlatmadan gelen gelir tek ekranda." },
  ];
  const plans = [
    { n: "Vitrin", p: "990", f: ["Kliniğe özel web sitesi", "Online randevu", "Google yorum isteği", "Alt alan adı"] },
    { n: "Klinik", p: "1.990", f: ["Vitrin'deki her şey", "Otomatik aşı hatırlatma", "Hasta ve aşı kayıtları", "QR aşı karnesi", "Kendi alan adınız"], hot: true },
    { n: "Pro", p: "3.490", f: ["Klinik'teki her şey", "Çoklu şube", "Yapay zekâ ile içerik", "Öncelikli destek"] },
  ];
  return (
    <div className="platform">
      <PlatformWalk />
      <header className="pf-header">
        <div className="container pf-header-inner">
          <Link href="/" className="pf-brand"><span className="pf-logo"><Paw kind="kedi" size={22} /></span> PatiPanel</Link>
          <nav>
            <a href="#ozellikler">Özellikler</a>
            <a href="#demolar">Demo siteler</a>
            <a href="#fiyat">Fiyatlar</a>
            <Link href="/giris" className="btn btn-primary btn-sm">Panele giriş</Link>
          </nav>
        </div>
      </header>

      <section className="pf-hero">
        <FloatingPaws pawType="karisik" count={20} />
        <div className="container pf-hero-inner">
          <span className="hero-badge"><Sparkles size={14} /> Veteriner klinikleri için hepsi bir arada</span>
          <HeroWords text="Kliniğinizin dijital yüzü, aşı takibi ve randevusu tek yerde" className="pf-title" />
          <p className="pf-sub">PatiPanel kliniğinize göz alıcı bir web sitesi kurar, telefon trafiğini online randevuya çevirir ve aşı zamanı gelen her hastayı WhatsApp ile geri getirir.</p>
          <div className="hero-cta center">
            <a href="#demolar" className="btn btn-primary btn-lg">Demo siteleri gez <ArrowRight size={18} /></a>
            <Link href="/giris" className="btn btn-ghost btn-lg">Paneli dene</Link>
          </div>
          <div className="pf-proof">
            <span><Check size={16} /> Kurulum 1 gün</span>
            <span><Check size={16} /> KVKK uyumlu onaylar</span>
            <span><Check size={16} /> Taahhüt yok</span>
          </div>
        </div>
      </section>

      <section className="section" id="demolar">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow"><Paw kind="kopek" size={14} /> Canlı demolar</span>
            <h2>Aynı altyapı, bambaşka klinikler</h2>
            <p className="muted">Her klinik kendi teması, renkleri ve pati tipiyle. Tıklayıp gezin, randevu almayı deneyin.</p>
          </Reveal>
          <div className="demo-grid">
            {clinics.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.1}>
                <a href={`/k/${c.slug}`} className="demo-card" style={{ ["--cc" as string]: c.primaryColor, ["--ca" as string]: c.accentColor }}>
                  <div className="demo-browser">
                    <div className="db-bar"><i /><i /><i /><span>{c.domain ?? `${c.slug}.localhost`}</span></div>
                    <div className="db-frame"><iframe src={`/k/${c.slug}`} title={c.name} loading="lazy" tabIndex={-1} /></div>
                  </div>
                  <div className="demo-info">
                    <strong>{c.name}</strong>
                    <small>{c.city} · {c.theme === "sicak" ? "Sıcak" : c.theme === "modern" ? "Modern" : "Egzotik"} tema</small>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="ozellikler">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow"><Paw kind="kedi" size={14} /> Neler var?</span>
            <h2>Klinik yazılımınızın yapmadığı her şey</h2>
          </Reveal>
          <div className="cards-3">
            {features.map((f, i) => (
              <Reveal key={f.t} delay={(i % 3) * 0.08}>
                <div className="pf-feature">
                  <span className="svc-icon"><f.icon size={26} /></span>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow"><MessageCircle size={14} /> Nasıl çalışır?</span>
            <h2>Kaybolan hasta, geri gelen gelir</h2>
          </Reveal>
          <div className="flow">
            {[
              ["Aşı kaydedilir", "Hekim panelde aşıyı işler, sistem sonraki tarihi hesaplar."],
              ["14 gün önce mesaj", "Sahibine WhatsApp'tan kişisel hatırlatma ve randevu linki gider."],
              ["Tek tıkla randevu", "Link formu doldurulmuş açar. Sahibi sadece saati seçer."],
              ["Panelde ölçülür", "“Bu ay hatırlatmadan 23 randevu geldi.” Değer ortada."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.12} className="flow-step">
                <span className="flow-num">{i + 1}</span>
                <h4>{t}</h4>
                <p>{d}</p>
                {i < 3 && <span className="flow-paws" aria-hidden><Paw kind="kedi" size={14} /><Paw kind="kedi" size={14} /><Paw kind="kedi" size={14} /></span>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="fiyat">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow">Fiyatlar (örnek)</span>
            <h2>Ayda birkaç geri gelen hasta, aboneliği öder</h2>
          </Reveal>
          <div className="plans">
            {plans.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div className={`plan ${p.hot ? "hot" : ""}`}>
                  {p.hot && <span className="plan-tag">En çok tercih edilen</span>}
                  <h3>{p.n}</h3>
                  <div className="plan-price"><strong>{p.p} TL</strong><span>/ay</span></div>
                  <ul>{p.f.map((x) => <li key={x}><Check size={16} /> {x}</li>)}</ul>
                  <Link href="/giris" className={`btn ${p.hot ? "btn-primary" : "btn-ghost"}`}>Demoyu dene</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="pf-footer">
        <div className="container">
          <span className="pf-brand"><span className="pf-logo"><Paw kind="kedi" size={18} /></span> PatiPanel</span>
          <span className="muted">Veteriner klinikleri için web sitesi, randevu ve hatırlatma platformu.</span>
        </div>
      </footer>
    </div>
  );
}
