import type { ReactNode } from "react";
import logo from "@/assets/Skytlab logo M2.png";

/** Centred card used by the sign-in and password reset pages. */
export function AuthCard({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src={logo} alt="SkytLabs Limited" className="h-9 w-auto" />
          <p className="text-sm font-medium text-muted-foreground">Website administration</p>
        </div>
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          : "rounded-md bg-primary/10 px-3 py-2 text-sm text-primary"
      }
    >
      {children}
    </p>
  );
}
