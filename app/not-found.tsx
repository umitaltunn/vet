import Link from "next/link";
export default function NotFound() {
  return (
    <div className="platform nf">
      <div className="nf-paws" aria-hidden>🐾 🐾 🐾</div>
      <h1>Bu sayfa bahçeden kaçmış!</h1>
      <p className="muted">Aradığınız sayfa ya da klinik bulunamadı.</p>
      <Link href="/" className="btn btn-primary">Ana sayfaya dön</Link>
    </div>
  );
}
