import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Cloud,
  Code2,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import heroOffice from "@/assets/hero-office.jpg";
import aiCallCenter from "@/assets/ai-call-center.jpg";
import { CtaBanner, Eyebrow, Section } from "@/components/site-sections";
import { SERVICE_GROUPS } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkytLabs Limited — IT Consulting & Digital Transformation, Lagos" },
      {
        name: "description",
        content:
          "SkytLabs Limited helps Nigerian enterprises build software, automate operations, secure infrastructure and turn data into decisions.",
      },
      {
        property: "og:title",
        content: "SkytLabs Limited — IT Consulting & Digital Transformation, Lagos",
      },
      {
        property: "og:description",
        content:
          "Software, automation, cloud, cybersecurity and data consulting for enterprises across Nigeria and beyond.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const HIGHLIGHTS = [
  {
    icon: Code2,
    title: "Software Development & Deployment",
    body: "Systems built around how your business actually operates, shipped through disciplined release pipelines.",
  },
  {
    icon: Workflow,
    title: "Business Automation",
    body: "Paper, queues and rework removed from core processes so teams spend their time on judgement, not admin.",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity & Risk Management",
    body: "Controls, identity governance and risk frameworks that satisfy regulators and survive real attackers.",
  },
];

const DIFFERENTIATORS = [
  {
    icon: BarChart3,
    title: "Outcomes before technology",
    body: "Every engagement starts with the business metric that has to move. Architecture follows the outcome, not the other way round.",
  },
  {
    icon: Cloud,
    title: "Local context, global standards",
    body: "We design for Nigerian realities — connectivity, regulation, cost — while holding to international engineering practice.",
  },
  {
    icon: ShieldCheck,
    title: "We stay after go-live",
    body: "Delivery is not the finish line. Our DevOps and operations teams keep platforms secure, observable and available.",
  },
];

function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <img
          src={heroOffice}
          alt="SkytLabs consultants reviewing analytics dashboards in a Lagos office at dusk"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8 lg:py-40">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-cyan uppercase">
            <span className="brand-gradient-bar h-px w-8" aria-hidden="true" />
            IT Consulting · Lagos, Nigeria
          </p>
          <h1 className="mt-7 max-w-4xl text-4xl leading-[1.03] font-bold sm:text-5xl lg:text-7xl">
            Engineering the digital backbone of{" "}
            <span className="brand-gradient-text">African enterprise</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-navy-foreground/75">
            SkytLabs Limited partners with organisations to design, build, secure and operate the
            technology their business depends on — from enterprise architecture and cloud
            infrastructure to automation, analytics and AI.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3.5 text-sm font-semibold text-cyan-foreground transition-opacity hover:opacity-90"
            >
              Explore our services
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-navy-foreground/25 px-6 py-3.5 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy-foreground/10"
            >
              Speak with a consultant
            </Link>
          </div>
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              Ten disciplines, one delivery team
            </h2>
            <p className="mt-4 text-muted-foreground">
              Strategy, engineering, infrastructure, security and operations under a single
              accountable partner — so nothing falls between vendors.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            All ten services
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Why SkytLabs</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              A consulting partner that carries the delivery risk
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most technology programmes fail on execution, not on ideas. We build teams that stay
              accountable from the first workshop through to production support.
            </p>
            <dl className="mt-10 space-y-8">
              {DIFFERENTIATORS.map((item) => (
                <div key={item.title} className="flex gap-5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="font-semibold">{item.title}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICE_GROUPS.map((group) => (
              <div key={group.id} className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold text-primary">{group.group}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {group.services.map((service) => (
                    <li key={service.title}>{service.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <Eyebrow>Our product</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">AI Call Center</h2>
            <p className="mt-4 text-muted-foreground">
              A conversational AI solution that reaches your target audience at scale — running
              natural voice conversations, capturing every response, and surfacing the results in a
              rich dashboard built for decision-making.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {[
                "Automated outbound conversations across thousands of contacts",
                "Structured capture of every response and outcome",
                "Live dashboard for campaign performance and sentiment",
                "Insight ready for the next operational decision",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to="/products"
              className="mt-9 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              See the product
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src={aiCallCenter}
              alt="AI Call Center voice waveform feeding a live analytics dashboard"
              width={1600}
              height={1104}
              loading="lazy"
              className="w-full rounded-2xl border border-border object-cover"
            />
          </div>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
