import { ExternalLink, Globe } from "lucide-react";
import { requireClinicUser } from "@/lib/auth";
import { PAW_TYPES, THEMES, parseHours, subdomainUrl } from "@/lib/clinic";
import { DAY_NAMES_TR } from "@/lib/time";
import { Paw } from "@/components/fx/Paw";
import { SubmitButton } from "@/components/panel/Buttons";
import { updateHours, updateSite } from "../actions";

export const dynamic = "force-dynamic";

export default async function SiteSettings() {
  const { clinic } = await requireClinicUser();
  const hours = parseHours(clinic.workingHours);
  const colors = [
    ["primaryColor", "Ana renk", clinic.primaryColor],
    ["accentColor", "Vurgu rengi", clinic.accentColor],
    ["bgColor", "Arka plan", clinic.bgColor],
    ["darkColor", "Yazı rengi", clinic.darkColor],
    ["goldColor", "Yardımcı renk", clinic.goldColor],
  ] as const;
  return (
    <div className="pn-page">
      <header className="pn-head">
        <div>
          <h1>Web Sitesi</h1>
          <p className="muted">Değişiklikler kaydedince sitede anında yayına girer.</p>
        </div>
        <a href={`/k/${clinic.slug}`} target="_blank" className="btn btn-ghost"><ExternalLink size={16} /> Siteyi aç</a>
      </header>

      <div className="pn-card addr-card">
        <Globe size={20} />
        <div>
          <strong>Site adresleri</strong>
          <small className="block"><a href={`/k/${clinic.slug}`} target="_blank">localhost:3000/k/{clinic.slug}</a> · <a href={subdomainUrl(clinic.slug)} target="_blank">{subdomainUrl(clinic.slug).replace(/^https?:\/\//, "")}</a>{clinic.domain && <> · <strong>{clinic.domain}</strong></>}</small>
        </div>
      </div>

      <form action={updateSite} className="settings">
        <section className="pn-card">
          <h2>Tema</h2>
          <div className="theme-picker">
            {THEMES.map((t) => (
              <label key={t.id} className={`theme-opt to-${t.id}`}>
                <input type="radio" name="theme" value={t.id} defaultChecked={clinic.theme === t.id} />
                <span className="to-preview"><i /><i /><i /></span>
                <strong>{t.name}</strong>
                <small>{t.desc}</small>
              </label>
            ))}
          </div>
          <h3 className="mt">Renkler</h3>
          <div className="color-row">
            {colors.map(([k, label, v]) => (
              <label key={k} className="color-opt"><input type="color" name={k} defaultValue={v} /><span>{label}</span></label>
            ))}
          </div>
          <h3 className="mt">Pati tipi</h3>
          <div className="paw-picker">
            {PAW_TYPES.map((p) => (
              <label key={p.id} className="paw-opt">
                <input type="radio" name="pawType" value={p.id} defaultChecked={clinic.pawType === p.id} />
                <span>{p.id === "karisik" ? <><Paw kind="kedi" size={22} /><Paw kind="kopek" size={22} /></> : <Paw kind={p.id} size={26} />}</span>
                <small>{p.name}</small>
              </label>
            ))}
          </div>
          <h3 className="mt">Animasyon yoğunluğu</h3>
          <div className="seg-radio">
            {[["sakin", "Sakin", "Sadece yumuşak geçişler"], ["normal", "Normal", "Pati geçişleri, yüzen patiler"], ["coskulu", "Coşkulu", "Hepsi: pati yolu, kaydırma izi, konfeti"]].map(([v, l, d]) => (
              <label key={v}><input type="radio" name="animationLevel" value={v} defaultChecked={clinic.animationLevel === v} /><span><strong>{l}</strong><small>{d}</small></span></label>
            ))}
          </div>
          <label className="check mt"><input type="checkbox" name="cursorTrail" defaultChecked={clinic.cursorTrail} /> <span>Fare imleci pati izi bıraksın (masaüstü)</span></label>
        </section>

        <section className="pn-card">
          <h2>Logo ve metinler</h2>
          <div className="logo-row">
            {clinic.logoUrl ? <img src={clinic.logoUrl} alt="" className="logo-prev" /> : <span className="logo-prev empty-logo"><Paw kind="kedi" size={40} /></span>}
            <div>
              <label>Yeni logo yükle (PNG, şeffaf arka plan önerilir)<input type="file" name="logo" accept="image/*" /></label>
              {clinic.logoUrl && <label className="check"><input type="checkbox" name="removeLogo" /> <span>Logoyu kaldır</span></label>}
            </div>
          </div>
          <div className="form-grid">
            <label className="full">Klinik adı<input name="name" defaultValue={clinic.name} required /></label>
            <label className="full">Slogan<input name="tagline" defaultValue={clinic.tagline} /></label>
            <label className="full">Ana başlık<input name="heroTitle" defaultValue={clinic.heroTitle} /></label>
            <label className="full">Alt başlık<textarea name="heroSubtitle" rows={2} defaultValue={clinic.heroSubtitle} /></label>
            <label className="full">Hakkımızda<textarea name="about" rows={4} defaultValue={clinic.about} /></label>
          </div>
        </section>

        <section className="pn-card">
          <h2>İletişim</h2>
          <div className="form-grid">
            <label>Telefon<input name="phone" defaultValue={clinic.phone} /></label>
            <label>WhatsApp<input name="whatsapp" defaultValue={clinic.whatsapp} /></label>
            <label>Acil hattı (boşsa gösterilmez)<input name="emergencyPhone" defaultValue={clinic.emergencyPhone} /></label>
            <label>E-posta<input name="email" defaultValue={clinic.email} /></label>
            <label className="full">Adres<input name="address" defaultValue={clinic.address} /></label>
            <label>Şehir<input name="city" defaultValue={clinic.city} /></label>
            <label>Harita arama metni<input name="mapQuery" defaultValue={clinic.mapQuery} placeholder="Moda Caddesi Kadıköy" /></label>
            <label>Instagram kullanıcı adı<input name="instagram" defaultValue={clinic.instagram} /></label>
            <label>Google yorum linki<input name="googleReviewUrl" defaultValue={clinic.googleReviewUrl} placeholder="https://g.page/r/.../review" /></label>
          </div>
        </section>
        <div className="sticky-save"><SubmitButton className="btn btn-primary btn-lg">Kaydet ve yayınla</SubmitButton></div>
      </form>

      <section className="pn-card">
        <h2>Çalışma saatleri ve randevu aralığı</h2>
        <form action={updateHours}>
          <div className="hours-editor">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const r = hours[String(d)] ?? [];
              return (
                <div key={d} className="he-row">
                  <label className="check"><input type="checkbox" name={`open-${d}`} defaultChecked={r.length > 0} /> <span>{DAY_NAMES_TR[d]}</span></label>
                  <input type="time" name={`a1-${d}`} defaultValue={r[0]?.[0] ?? "09:00"} />–<input type="time" name={`b1-${d}`} defaultValue={r[0]?.[1] ?? "12:30"} />
                  <span className="muted">ve</span>
                  <input type="time" name={`a2-${d}`} defaultValue={r[1]?.[0] ?? ""} />–<input type="time" name={`b2-${d}`} defaultValue={r[1]?.[1] ?? ""} />
                </div>
              );
            })}
          </div>
          <label className="inline">Randevu aralığı (dk) <input type="number" name="slotMinutes" min={10} max={120} step={5} defaultValue={clinic.slotMinutes} /></label>
          <div className="mt"><SubmitButton>Saatleri kaydet</SubmitButton></div>
        </form>
      </section>
    </div>
  );
}
