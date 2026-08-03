import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Gauge, MessageSquare, PhoneCall, Sparkles, Users } from "lucide-react";
import aiCallCenter from "@/assets/ai-call-center.jpg";
import { CtaBanner, Eyebrow, PageHero, Section } from "@/components/site-sections";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "AI Call Center — Conversational AI Product by SkytLabs" },
      {
        name: "description",
        content:
          "AI Call Center by SkytLabs is a conversational AI solution that reaches your target audience at scale and reports every response in a decision-ready dashboard.",
      },
      { property: "og:title", content: "AI Call Center — Conversational AI by SkytLabs" },
      {
        property: "og:description",
        content:
          "Automated outbound voice conversations, structured response capture and a rich analytics dashboard.",
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

const FEATURES = [
  {
    icon: PhoneCall,
    title: "Outbound at scale",
    body: "Reach thousands of contacts with natural, on-brand voice conversations that run concurrently instead of queueing behind agents.",
  },
  {
    icon: MessageSquare,
    title: "Conversational, not scripted",
    body: "The assistant understands answers, handles follow-up questions and adapts the flow rather than reading a rigid script.",
  },
  {
    icon: BarChart3,
    title: "Rich response dashboard",
    body: "Every call is captured, categorised and charted — completion rates, sentiment, objections and outcomes in one view.",
  },
  {
    icon: Gauge,
    title: "Decision-ready reporting",
    body: "Results roll up into the metrics leadership actually uses, so the next campaign decision is made on evidence.",
  },
  {
    icon: Users,
    title: "Audience segmentation",
    body: "Target lists by segment, region or lifecycle stage and compare how each cohort responds to the same conversation.",
  },
  {
    icon: Sparkles,
    title: "Configured to your process",
    body: "We tune the conversation design, escalation rules and integrations to your existing CRM and operating procedures.",
  },
];

const USE_CASES = [
  "Customer satisfaction and feedback campaigns",
  "Collections, renewals and payment reminders",
  "Lead qualification and appointment setting",
  "Field surveys and member outreach at population scale",
];

function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="AI Call Center"
        intro="A conversational AI solution that helps your organisation call its target audience at scale — with a rich dashboard for responses and decision-making."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <img
            src={aiCallCenter}
            alt="AI Call Center conversational waveform connected to an analytics dashboard"
            width={1600}
            height={1104}
            loading="lazy"
            className="w-full rounded-2xl border border-border object-cover"
          />
          <div>
            <Eyebrow>The problem it solves</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              Human capacity should not cap your outreach
            </h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              <p>
                Traditional call centres scale by hiring. Campaigns get trimmed to fit the roster,
                notes are inconsistent, and the results arrive too late to change anything.
              </p>
              <p>
                AI Call Center removes that ceiling. Conversations run concurrently, every response
                is captured in a structured form, and the dashboard updates while the campaign is
                still live — so you can adjust the message rather than review it afterwards.
              </p>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {USE_CASES.map((useCase) => (
                <li key={useCase} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>Capabilities</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
          What comes with AI Call Center
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-border bg-card p-8">
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
        <Link
          to="/contact"
          className="mt-12 inline-flex items-center rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Request a demo
        </Link>
      </Section>

      <CtaBanner
        title="See AI Call Center on your own campaign"
        body="Send us a sample audience and objective, and we will walk you through how the conversation and dashboard would work for it."
      />
    </>
  );
}
