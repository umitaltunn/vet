"use client";
export default function PanelError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="pn-card" style={{ maxWidth: 560 }}>
      <h2>Bir şeyler ters gitti</h2>
      <p className="muted">{error.message || "Beklenmeyen bir hata oluştu."}</p>
      <button className="btn btn-primary" onClick={reset}>Tekrar dene</button>
    </div>
  );
}
