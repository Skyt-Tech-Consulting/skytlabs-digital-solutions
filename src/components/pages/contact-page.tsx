import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import type { PageContent, SiteSettings } from "@/lib/cms/defaults";
import { getContactConfig, submitEnquiry } from "@/lib/cms/api/public";
import { Eyebrow, PageHero, Section } from "@/components/site-sections";

type TurnstileApi = {
  render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => string;
  reset: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const fieldClass =
  "mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

function useTurnstile(siteKey: string | null, onToken: (token: string) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenCb = useRef(onToken);
  tokenCb.current = onToken;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    const el = ref.current;
    const render = () => {
      if (window.turnstile && el.childElementCount === 0) {
        widgetId.current = window.turnstile.render(el, {
          sitekey: siteKey,
          callback: (t) => tokenCb.current(t),
        });
      }
    };
    if (window.turnstile) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [siteKey]);

  return {
    ref,
    reset: () => {
      if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
    },
  };
}

export function ContactPage({
  content,
  company,
}: {
  content: PageContent<"contact">;
  company: SiteSettings["company"];
}) {
  const { hero, details, form } = content;
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const startedAt = useRef<number>(0);
  const turnstile = useTurnstile(siteKey, setTurnstileToken);

  useEffect(() => {
    startedAt.current = Date.now();
    getContactConfig()
      .then((config) => setSiteKey(config.turnstileSiteKey))
      .catch(() => setSiteKey(null));
  }, []);

  const update = (field: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [field]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const result = await submitEnquiry({
        data: {
          ...values,
          website: honeypot,
          elapsedMs: Date.now() - startedAt.current,
          turnstileToken,
          pageUrl: window.location.href,
        },
      });
      if (result.ok) {
        setStatus("sent");
        setValues({ name: "", company: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
        setError(result.error);
        turnstile.reset();
      }
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error && e.message ? e.message : form.errorMessage);
      turnstile.reset();
    }
  }

  const mapSrc = details.mapLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(details.mapLocation)}&output=embed`
    : null;

  return (
    <>
      <PageHero {...hero} />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>{details.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{details.title}</h2>
            <dl className="mt-10 space-y-8">
              {company.address && (
                <ContactRow icon={MapPin} label={details.officeLabel}>
                  <span className="text-muted-foreground">{company.address}</span>
                </ContactRow>
              )}
              {company.email && (
                <ContactRow icon={Mail} label={details.emailLabel}>
                  <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                    {company.email}
                  </a>
                </ContactRow>
              )}
              {company.phone && (
                <ContactRow icon={Phone} label={details.phoneLabel}>
                  <a
                    href={`tel:${company.phone.replace(/\s+/g, "")}`}
                    className="text-primary hover:underline"
                  >
                    {company.phone}
                  </a>
                </ContactRow>
              )}
              {details.hours && (
                <ContactRow icon={Clock} label={details.hoursLabel}>
                  <span className="text-muted-foreground">{details.hours}</span>
                </ContactRow>
              )}
            </dl>

            {mapSrc && (
              <div className="mt-12 overflow-hidden rounded-2xl border border-border">
                <iframe
                  title={details.mapTitle}
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full border-0"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 lg:p-10">
            {status === "sent" ? (
              <div role="status" aria-live="polite" className="flex flex-col items-start py-6">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-6 text-2xl font-semibold">{form.successTitle}</h2>
                <p className="mt-3 text-muted-foreground">{form.successBody}</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    startedAt.current = Date.now();
                  }}
                  className="mt-8 text-sm font-semibold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{form.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{form.intro}</p>
                <form onSubmit={handleSubmit} className="mt-8" noValidate={false}>
                  <label className="block text-sm font-medium">
                    {form.nameLabel}
                    <input
                      required
                      maxLength={120}
                      autoComplete="name"
                      value={values.name}
                      onChange={(e) => update("name")(e.target.value)}
                      className={fieldClass}
                      placeholder={form.namePlaceholder}
                    />
                  </label>
                  <label className="mt-6 block text-sm font-medium">
                    {form.companyLabel}
                    <input
                      maxLength={160}
                      autoComplete="organization"
                      value={values.company}
                      onChange={(e) => update("company")(e.target.value)}
                      className={fieldClass}
                      placeholder={form.companyPlaceholder}
                    />
                  </label>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-medium">
                      {form.emailLabel}
                      <input
                        type="email"
                        required
                        maxLength={200}
                        autoComplete="email"
                        value={values.email}
                        onChange={(e) => update("email")(e.target.value)}
                        className={fieldClass}
                        placeholder={form.emailPlaceholder}
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      {form.phoneLabel}
                      <input
                        type="tel"
                        maxLength={40}
                        autoComplete="tel"
                        value={values.phone}
                        onChange={(e) => update("phone")(e.target.value)}
                        className={fieldClass}
                        placeholder={form.phonePlaceholder}
                      />
                    </label>
                  </div>
                  <label className="mt-6 block text-sm font-medium">
                    {form.messageLabel}
                    <textarea
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={6}
                      value={values.message}
                      onChange={(e) => update("message")(e.target.value)}
                      className={`${fieldClass} resize-y`}
                      placeholder={form.messagePlaceholder}
                    />
                  </label>

                  {/* Honeypot — hidden from people, tempting to bots. */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-[10000px] h-px w-px overflow-hidden"
                  >
                    <label>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </label>
                  </div>

                  {siteKey && <div ref={turnstile.ref} className="mt-6" />}

                  {status === "error" && error && (
                    <p
                      role="alert"
                      className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {status === "sending" && <Loader2 className="size-4 animate-spin" />}
                    {status === "sending" ? "Sending…" : form.submitLabel}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <dt className="font-semibold">{label}</dt>
        <dd className="mt-1.5 text-sm">{children}</dd>
      </div>
    </div>
  );
}
