export default function NotFound() {
  return (
    <section className="section center">
      <div className="container narrow">
        <div className="nf-dog" aria-hidden>🐾</div>
        <h1>Bu sayfa kaçmış!</h1>
        <p className="muted">Aradığınız sayfa bahçeden kaçmış olabilir. Ana sayfaya dönüp tekrar deneyin.</p>
        <a className="btn btn-primary" href="/">Ana sayfa</a>
      </div>
    </section>
  );
}
