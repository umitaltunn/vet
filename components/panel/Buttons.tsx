"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function SubmitButton({ children, className = "btn btn-primary", confirm: confirmText, title }: { children: ReactNode; className?: string; confirm?: string; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      disabled={pending}
      title={title}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {pending ? <Loader2 className="spin" size={16} /> : null}
      {children}
    </button>
  );
}
