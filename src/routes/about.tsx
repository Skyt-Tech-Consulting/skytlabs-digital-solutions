import { createFileRoute } from "@tanstack/react-router";
import { Compass, Handshake, Target } from "lucide-react";
import aboutTeam from "@/assets/about-team.jpg";
import { CtaBanner, Eyebrow, PageHero, Section } from "@/components/site-sections";
import { COMPANY } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SkytLabs Limited — Nigerian IT Consulting Firm" },
      {
        name: "description",
        content:
          "SkytLabs Limited is a Lagos-based IT consulting firm helping enterprises modernise, automate and secure the technology their business runs on.",
      },
      { property: "og:title", content: "About SkytLabs Limited" },
      {
        property: "og:description",
        content:
          "Who we are, how we work, and why Nigerian enterprises trust SkytLabs with their technology programmes.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Target,
    title: "Outcome ownership",
    body: "We measure our work by the business result it produces, not the hours it consumes or the documents it generates.",
  },
  {
    icon: Compass,
    title: "Architectural honesty",
    body: "We recommend the simplest system that will hold, and we say plainly when a proposed direction will not scale.",
  },
  {
    icon: Handshake,
    title: "Long partnerships",
    body: "Our clients keep us because we stay through go-live, hypercare and the unglamorous years of operation that follow.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A Nigerian consulting firm built for enterprise-grade delivery"
        intro={`${COMPANY.name} brings strategy, engineering and operations together so organisations can modernise without stalling the business that funds the modernisation.`}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              Consultants who also build, ship and operate
            </h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              <p>
                SkytLabs Limited is an IT consulting company headquartered in Lagos, Nigeria. We
                work with enterprises, public institutions and fast-scaling businesses that need
                more than advice — they need systems in production.
              </p>
              <p>
                Our practice spans ten disciplines, from IT strategy and enterprise architecture
                through software engineering, cloud infrastructure, cybersecurity, data and
                analytics, ERP and DevOps. Because those capabilities sit under one roof, a client
                gets a single accountable partner instead of a chain of vendors pointing at each
                other.
              </p>
              <p>
                We design for Nigerian operating realities — intermittent connectivity, regulatory
                obligations, tight cost envelopes — while holding to the engineering standards
                expected of any global delivery team.
              </p>
            </div>
          </div>
          <img
            src={aboutTeam}
            alt="SkytLabs consultants reviewing an enterprise architecture diagram"
            width={1408}
            height={1008}
            loading="lazy"
            className="w-full rounded-2xl border border-border object-cover"
          />
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>How we work</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
          Three commitments we hold on every engagement
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((value) => (
            <article key={value.title} className="rounded-xl border border-border bg-card p-8">
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <value.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Work with SkytLabs"
        body="Whether you are planning a transformation programme or need a delivery team that can execute one, we would like to hear about it."
      />
    </>
  );
}
