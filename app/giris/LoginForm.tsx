"use client";
import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="login-form">
      <label>E-posta<input name="email" type="email" required autoComplete="username" defaultValue="klinik@patidostu.com" /></label>
      <label>Şifre<input name="password" type="password" required autoComplete="current-password" defaultValue="pati123" /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? <Loader2 className="spin" size={18} /> : <LogIn size={18} />} Giriş yap
      </button>
    </form>
  );
}
