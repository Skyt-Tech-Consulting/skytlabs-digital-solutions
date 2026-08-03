import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin } from "lucide-react";
import { Eyebrow, PageHero, Section } from "@/components/site-sections";
import { COMPANY } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SkytLabs Limited — Magodo GRA, Lagos" },
      {
        name: "description",
        content:
          "Reach SkytLabs Limited at Plot 4, Church Street, Magodo GRA, Lagos or email info@skytlabs.com to discuss your technology programme.",
      },
      { property: "og:title", content: "Contact SkytLabs Limited" },
      {
        property: "og:description",
        content: "Plot 4, Church Street, Magodo GRA, Lagos. Email info@skytlabs.com.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const MAP_SRC =
  "https://www.google.com/maps?q=Church%20Street%2C%20Magodo%20GRA%2C%20Lagos%2C%20Nigeria&output=embed";

function ContactPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `Enquiry from ${name || "website visitor"}${company ? ` — ${company}` : ""}`;
    const body = [
      `Name: ${name}`,
      company ? `Company: ${company}` : "",
      replyTo ? `Email: ${replyTo}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  const fieldClass =
    "mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you are trying to build"
        intro="Send us the outcome you need and any constraints you are working within. We will respond with an approach and the right people to walk you through it."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Reach us</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">SkytLabs Limited, Lagos</h2>
            <dl className="mt-10 space-y-8">
              <div className="flex gap-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="font-semibold">Office</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{COMPANY.address}</dd>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="font-semibold">Email</dt>
                  <dd className="mt-1.5 text-sm">
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="text-primary hover:underline"
                    >
                      {COMPANY.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="font-semibold">Hours</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">
                    Monday to Friday, 9:00 – 18:00 WAT
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-12 overflow-hidden rounded-2xl border border-border">
              <iframe
                title="SkytLabs Limited office location in Magodo GRA, Lagos"
                src={MAP_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 lg:p-10">
            <h2 className="text-xl font-semibold">Send us a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This form opens your email client with the details filled in, addressed to{" "}
              {COMPANY.email}.
            </p>
            <form onSubmit={handleSubmit} className="mt-8">
              <label className="block text-sm font-medium">
                Your name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                  placeholder="Adaeze Okonkwo"
                />
              </label>
              <label className="mt-6 block text-sm font-medium">
                Company
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={fieldClass}
                  placeholder="Organisation name"
                />
              </label>
              <label className="mt-6 block text-sm font-medium">
                Email address
                <input
                  type="email"
                  required
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className={fieldClass}
                  placeholder="you@company.com"
                />
              </label>
              <label className="mt-6 block text-sm font-medium">
                How can we help?
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${fieldClass} resize-y`}
                  placeholder="Describe the outcome you are after, any deadlines, and systems already in place."
                />
              </label>
              <button
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Compose email
              </button>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}
