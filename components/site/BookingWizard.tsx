"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarPlus, Check, Loader2, MessageCircle, UserRound } from "lucide-react";
import { ServiceIcon } from "./Icon";
import { Paw, pickPaw } from "../fx/Paw";
import { pawBurst } from "../fx/burst";
import { PawLink } from "../fx/PawTransition";
import { addDays, fmtDayLabel, todayKey, weekday } from "@/lib/time";
import { waLink } from "@/lib/phone";

type Service = { id: string; name: string; description: string; durationMin: number; icon: string; priceText: string };
type Vet = { id: string; name: string; title: string; photoUrl: string | null };
type Slot = { time: string; vetIds: string[] };

const STEPS = ["Hizmet", "Hekim", "Tarih & Saat", "Bilgileriniz"];
const SPECIES = ["Kedi", "Köpek", "Kuş", "Tavşan", "Diğer"];
const DAY_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export function BookingWizard(props: {
  clinicId: string;
  clinicName: string;
  base: string;
  services: Service[];
  vets: Vet[];
  openDays: number[];
  colors: string[];
  pawType: string;
  whatsapp: string;
  initialService?: string;
  reminderToken?: string;
}) {
  const [step, setStep] = useState(props.initialService ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [serviceId, setServiceId] = useState(props.initialService ?? "");
  const [vetId, setVetId] = useState<string>("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ ownerName: "", ownerPhone: "", petName: "", petSpecies: "Kedi", note: "", kvkk: false });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { id: string; when: string; vetName: string }>(null);
  const [fromReminder, setFromReminder] = useState(false);

  const service = props.services.find((s) => s.id === serviceId);
  const days = useMemo(() => {
    const t = todayKey();
    return Array.from({ length: 21 }, (_, i) => addDays(t, i));
  }, []);

  // Hatirlatma linkinden gelindiyse bilgileri doldur
  useEffect(() => {
    if (!props.reminderToken) return;
    fetch(`/api/public/reminder?token=${encodeURIComponent(props.reminderToken)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setFromReminder(true);
        setForm((f) => ({ ...f, ownerName: d.ownerName ?? "", ownerPhone: d.ownerPhone ?? "", petName: d.petName ?? "", petSpecies: d.petSpecies ?? f.petSpecies }));
        if (d.serviceId) {
          setServiceId(d.serviceId);
          setStep(1);
        }
      })
      .catch(() => {});
  }, [props.reminderToken]);

  useEffect(() => {
    if (!day || !serviceId) return;
    setLoadingSlots(true);
    setTime("");
    const q = new URLSearchParams({ clinicId: props.clinicId, date: day, serviceId, ...(vetId ? { vetId } : {}) });
    fetch(`/api/public/slots?${q}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [day, serviceId, vetId, props.clinicId]);

  const rootRef = useRef<HTMLDivElement>(null);
  const toTop = () => {
    const el = rootRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 100;
    if (Math.abs(window.scrollY - y) > 40) window.scrollTo({ top: y, behavior: "smooth" });
  };
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setError("");
    toTop();
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.kvkk) return setError("Devam etmek için KVKK aydınlatma metnini onaylamanız gerekiyor.");
    setSending(true);
    try {
      const res = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId: props.clinicId, serviceId, vetId: vetId || null, date: day, time, ...form, h: props.reminderToken ?? null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Bir hata oluştu");
      setDone({ id: d.id, when: `${fmtDayLabel(day)}, ${time}`, vetName: d.vetName ?? "" });
      setDir(1);
      setStep(4);
      toTop();
      setTimeout(() => {
        pawBurst(window.innerWidth / 2, window.innerHeight / 2.4, { colors: props.colors, count: 70, hearts: true, kinds: props.pawType === "karisik" ? ["kedi", "kopek"] : [pickPaw(props.pawType)] });
      }, 250);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      if (String(err).includes("dolu")) go(2);
    } finally {
      setSending(false);
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d * 80, opacity: 0, rotate: d * 2 }),
    center: { x: 0, opacity: 1, rotate: 0 },
    exit: (d: number) => ({ x: d * -80, opacity: 0, rotate: d * -2 }),
  };

  return (
    <div className="wizard" ref={rootRef}>
      {/* Pati ilerleme cubugu */}
      <div className="wz-track">
        <div className="wz-line"><motion.div className="wz-fill" animate={{ width: `${(Math.min(step, 3) / 3) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} /></div>
        {STEPS.map((s, i) => (
          <button key={s} type="button" className={`wz-stop ${i <= step ? "on" : ""}`} style={{ left: `${(i / 3) * 100}%` }} onClick={() => i < step && step < 4 && go(i)} disabled={i >= step || step === 4}>
            <motion.span className="wz-dot" animate={{ scale: i === step ? 1.25 : 1 }}>
              {i < step ? <Check size={14} /> : i + 1}
            </motion.span>
            <span className="wz-label">{s}</span>
          </button>
        ))}
        <motion.span className="wz-walker" animate={{ left: `${(Math.min(step, 3) / 3) * 100}%` }} transition={{ type: "spring", stiffness: 90, damping: 14 }}>
          <motion.span animate={{ rotate: [0, -12, 12, 0], y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ display: "inline-block" }}>
            <Paw kind={pickPaw(props.pawType)} size={26} />
          </motion.span>
        </motion.span>
      </div>

      {fromReminder && step < 4 && (
        <div className="wz-note">
          <Paw kind={pickPaw(props.pawType)} size={16} /> Hatırlatma mesajınızdan geldiniz, bilgilerinizi sizin için doldurduk.
        </div>
      )}

      <div className="wz-body">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.3, 0.7, 0.2, 1] }}>
            {step === 0 && (
              <div>
                <h2 className="wz-title">Hangi hizmet için geliyorsunuz?</h2>
                <div className="wz-grid">
                  {props.services.map((s, i) => (
                    <motion.button
                      type="button"
                      key={s.id}
                      className={`wz-card ${serviceId === s.id ? "sel" : ""}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setServiceId(s.id);
                        setTimeout(() => go(1), 180);
                      }}
                    >
                      <span className="wz-icon"><ServiceIcon name={s.icon} /></span>
                      <strong>{s.name}</strong>
                      <small>{s.durationMin} dk{s.priceText ? ` · ${s.priceText}` : ""}</small>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="wz-title">Tercih ettiğiniz hekim</h2>
                <div className="wz-grid">
                  <motion.button type="button" className={`wz-card ${vetId === "" ? "sel" : ""}`} whileHover={{ y: -4 }} onClick={() => { setVetId(""); setTimeout(() => go(2), 180); }}>
                    <span className="wz-icon"><Paw kind={pickPaw(props.pawType)} size={26} /></span>
                    <strong>Fark etmez</strong>
                    <small>En erken uygun saat</small>
                  </motion.button>
                  {props.vets.map((v, i) => (
                    <motion.button type="button" key={v.id} className={`wz-card ${vetId === v.id ? "sel" : ""}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} onClick={() => { setVetId(v.id); setTimeout(() => go(2), 180); }}>
                      <span className="wz-avatar">{v.photoUrl ? <img src={v.photoUrl} alt="" /> : <UserRound size={26} />}</span>
                      <strong>{v.name}</strong>
                      <small>{v.title}</small>
                    </motion.button>
                  ))}
                </div>
                <div className="wz-nav"><button type="button" className="btn btn-ghost" onClick={() => go(0)}><ArrowLeft size={16} /> Geri</button></div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="wz-title">Gün ve saat seçin</h2>
                <p className="muted">{service?.name} · {service?.durationMin} dakika</p>
                <div className="wz-days">
                  {days.map((d) => {
                    const closed = !props.openDays.includes(weekday(d));
                    const dt = new Date(`${d}T12:00:00Z`);
                    return (
                      <button type="button" key={d} disabled={closed} className={`wz-day ${day === d ? "sel" : ""}`} onClick={() => setDay(d)}>
                        <small>{DAY_SHORT[weekday(d)]}</small>
                        <strong>{dt.getUTCDate()}</strong>
                        <small>{dt.toLocaleDateString("tr-TR", { month: "short", timeZone: "UTC" })}</small>
                      </button>
                    );
                  })}
                </div>
                <div className="wz-slots">
                  {!day && <p className="muted">Önce bir gün seçin.</p>}
                  {day && loadingSlots && <p className="muted wz-loading"><Loader2 className="spin" size={18} /> Boş saatler aranıyor…</p>}
                  {day && !loadingSlots && slots && slots.length === 0 && <p className="muted">Bu gün için boş saat kalmadı. Başka bir gün deneyin.</p>}
                  {day && !loadingSlots && slots && slots.length > 0 && (
                    <div className="wz-times">
                      {slots.map((s, i) => (
                        <motion.button type="button" key={s.time} className={`wz-time ${time === s.time ? "sel" : ""}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.015 }} onClick={() => setTime(s.time)}>
                          {s.time}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                {error && <p className="wz-error">{error}</p>}
                <div className="wz-nav">
                  <button type="button" className="btn btn-ghost" onClick={() => go(1)}><ArrowLeft size={16} /> Geri</button>
                  <button type="button" className="btn btn-primary" disabled={!day || !time} onClick={() => go(3)}>Devam <ArrowRight size={16} /></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={submit}>
                <h2 className="wz-title">Son adım: bilgileriniz</h2>
                <p className="wz-summary"><CalendarCheck size={16} /> {service?.name} · {day && fmtDayLabel(day)} · {time}</p>
                <div className="form-grid">
                  <label>Adınız soyadınız<input required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Ayşe Yılmaz" /></label>
                  <label>Cep telefonu<input required type="tel" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} placeholder="05xx xxx xx xx" /></label>
                  <label>Dostunuzun adı<input required value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} placeholder="Pamuk" /></label>
                  <label>Türü
                    <div className="seg">
                      {SPECIES.map((s) => (
                        <button type="button" key={s} className={form.petSpecies === s ? "sel" : ""} onClick={() => setForm({ ...form, petSpecies: s })}>{s}</button>
                      ))}
                    </div>
                  </label>
                  <label className="full">Eklemek istedikleriniz (isteğe bağlı)<textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Şikayet, alerji, kullandığı ilaçlar…" /></label>
                  <label className="check full">
                    <input type="checkbox" checked={form.kvkk} onChange={(e) => setForm({ ...form, kvkk: e.target.checked })} />
                    <span>Kişisel verilerimin randevu ve aşı hatırlatma amacıyla işlenmesine ve bana WhatsApp/SMS ile ulaşılmasına onay veriyorum (KVKK).</span>
                  </label>
                </div>
                {error && <p className="wz-error">{error}</p>}
                <div className="wz-nav">
                  <button type="button" className="btn btn-ghost" onClick={() => go(2)}><ArrowLeft size={16} /> Geri</button>
                  <button type="submit" className="btn btn-primary btn-lg btn-paw" disabled={sending}>
                    {sending ? <><Loader2 className="spin" size={18} /> Gönderiliyor</> : <>Randevuyu Oluştur <Check size={18} /></>}
                  </button>
                </div>
              </form>
            )}

            {step === 4 && done && (
              <div className="wz-done">
                <motion.div className="wz-done-icon" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 10 }}>
                  <Check size={46} strokeWidth={3} />
                </motion.div>
                <h2>Randevu talebiniz alındı!</h2>
                <p className="wz-when">{done.when}{done.vetName ? ` · ${done.vetName}` : ""}</p>
                <p className="muted">{props.clinicName} talebinizi onayladığında size WhatsApp/SMS ile haber vereceğiz. Aşı zamanı geldiğinde de hatırlatacağız.</p>
                <div className="wz-done-actions">
                  <a className="btn btn-ghost" href={`/api/public/ics?id=${done.id}`}><CalendarPlus size={18} /> Takvime ekle</a>
                  {props.whatsapp && <a className="btn btn-ghost" href={waLink(props.whatsapp, `Merhaba, ${done.when} için randevu talebi oluşturdum.`)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp'tan yaz</a>}
                  <PawLink className="btn btn-primary" href={props.base || "/"}>Ana sayfaya dön</PawLink>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
