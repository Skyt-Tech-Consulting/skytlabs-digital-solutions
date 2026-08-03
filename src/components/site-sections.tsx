import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "navy";
}) {
  return (
    <section
      className={cn(
        "px-5 py-20 lg:px-8 lg:py-28",
        tone === "muted" && "bg-surface",
        tone === "navy" && "bg-navy text-navy-foreground",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
      <span className="brand-gradient-bar h-px w-8" aria-hidden="true" />
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy px-5 py-20 text-navy-foreground lg:px-8 lg:py-28">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-24 size-96 rounded-full bg-cyan/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-cyan uppercase">
          <span className="brand-gradient-bar h-px w-8" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-foreground/70">{intro}</p>
      </div>
    </section>
  );
}

export function CtaBanner({
  title = "Let's scope your next initiative",
  body = "Tell us the outcome you need. We will come back with an approach, a timeline and the team that delivers it.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="px-5 py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-navy px-8 py-14 text-navy-foreground lg:px-14">
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 size-80 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
            <p className="mt-4 text-navy-foreground/70">{body}</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-cyan px-6 py-3.5 text-sm font-semibold text-cyan-foreground transition-opacity hover:opacity-90"
          >
            Start a conversation
          </Link>
        </div>
      </div>
    </section>
  );
}
