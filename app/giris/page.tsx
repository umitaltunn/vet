import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Paw } from "@/components/fx/Paw";
import { FloatingPaws } from "@/components/fx/Motion";

export const metadata = { title: "Giriş · PatiPanel" };

export default function LoginPage() {
  return (
    <div className="platform login-page">
      <FloatingPaws pawType="karisik" count={18} />
      <div className="login-card">
        <Link href="/" className="pf-brand"><span className="pf-logo"><Paw kind="kedi" size={22} /></span> PatiPanel</Link>
        <h1>Klinik paneline giriş</h1>
        <LoginForm />
        <div className="demo-creds">
          <strong>Demo hesaplar</strong>
          <span>Klinik: <code>klinik@patidostu.com</code> / <code>pati123</code></span>
          <span>Diğer klinikler: <code>klinik@anadoluvet.com</code>, <code>klinik@mavikanat.com</code> / <code>pati123</code></span>
          <span>Platform yöneticisi: <code>admin@patipanel.local</code> / <code>admin123</code></span>
        </div>
      </div>
    </div>
  );
}
