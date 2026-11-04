import { Plus, Star, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireClinicUser } from "@/lib/auth";
import { SubmitButton } from "@/components/panel/Buttons";
import { addGalleryImage, deleteGalleryImage, deleteTestimonial, saveTestimonial } from "../actions";

export const dynamic = "force-dynamic";

export default async function Content() {
  const { clinicId } = await requireClinicUser();
  const [images, testimonials] = await Promise.all([
    db.galleryImage.findMany({ where: { clinicId }, orderBy: { order: "asc" } }),
    db.testimonial.findMany({ where: { clinicId } }),
  ]);
  return (
    <div className="pn-page">
      <header className="pn-head"><div><h1>Galeri & Yorumlar</h1><p className="muted">Sitenin Galeri sayfası ve ana sayfadaki yorumlar.</p></div></header>
      <section className="pn-card">
        <h2>Galeri</h2>
        <div className="gal-admin">
          {images.map((g) => (
            <figure key={g.id}>
              <img src={g.url} alt={g.caption} />
              <figcaption>{g.caption}</figcaption>
              <form action={deleteGalleryImage.bind(null, g.id)}><SubmitButton className="icon-btn bad" confirm="Görsel silinsin mi?" title="Sil"><Trash2 size={14} /></SubmitButton></form>
            </figure>
          ))}
          {images.length === 0 && <p className="empty">Henüz görsel yok. Site şu an hazır yer tutucular gösteriyor.</p>}
        </div>
        <form action={addGalleryImage} className="form-grid inline-form">
          <label>Görsel<input type="file" name="image" accept="image/*" required /></label>
          <label>Açıklama<input name="caption" placeholder="Bekleme salonumuz" /></label>
          <div className="full"><SubmitButton><Plus size={16} /> Yükle</SubmitButton></div>
        </form>
      </section>
      <section className="pn-card">
        <h2>Yorumlar</h2>
        <ul className="pn-list">
          {testimonials.map((t) => (
            <li key={t.id}>
              <div><strong>{t.author}</strong> <small>· {t.petName} · {"★".repeat(t.rating)}</small><small className="block">{t.text}</small></div>
              <form action={deleteTestimonial.bind(null, t.id)}><SubmitButton className="icon-btn bad" confirm="Yorum silinsin mi?" title="Sil"><Trash2 size={14} /></SubmitButton></form>
            </li>
          ))}
        </ul>
        <form action={saveTestimonial} className="form-grid inline-form">
          <label>İsim<input name="author" required placeholder="Ayşe K." /></label>
          <label>Hayvanın adı<input name="petName" /></label>
          <label>Puan<select name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
          <label className="full">Yorum<textarea name="text" rows={2} required /></label>
          <div className="full"><SubmitButton><Star size={16} /> Yorum ekle</SubmitButton></div>
        </form>
      </section>
    </div>
  );
}
