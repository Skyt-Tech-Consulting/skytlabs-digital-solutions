import { createFileRoute } from "@tanstack/react-router";
import { Boxes, CalendarCheck, Plane, UserCog } from "lucide-react";
import digitalTransformation from "@/assets/digital-transformation.jpg";
import { CtaBanner, Eyebrow, PageHero, Section } from "@/components/site-sections";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Enterprise Digital Transformation | SkytLabs" },
      {
        name: "description",
        content:
          "How SkytLabs automated staff management, asset management and HR processes for an organisation to deliver measurable operational efficiency.",
      },
      { property: "og:title", content: "Projects — Enterprise Digital Transformation | SkytLabs" },
      {
        property: "og:description",
        content:
          "A digital transformation schedule covering staff management, performance review, asset management and HR service requests.",
      },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

const MODULES = [
  {
    icon: UserCog,
    title: "Staff Management",
    body: "Central employee profiling with role, department, reporting line and document records replacing scattered spreadsheets.",
  },
  {
    icon: CalendarCheck,
    title: "Employee Performance Review",
    body: "Structured review cycles with objectives, ratings and sign-off trails, so appraisal outcomes are traceable and on time.",
  },
  {
    icon: Boxes,
    title: "Asset Management",
    body: "Full asset register covering assignment, movement, maintenance and disposal, with accountability at the individual level.",
  },
  {
    icon: Plane,
    title: "Human Resource Management",
    body: "Leave application, travel desk and everyday HR requests routed through configurable approval workflows.",
  },
];

const OUTCOMES = [
  {
    title: "Manual steps removed",
    body: "Paper forms and email chains replaced by workflows with defined owners, timers and audit trails.",
  },
  {
    title: "Single source of truth",
    body: "Staff, asset and request data live in one place instead of being reconciled across departmental spreadsheets.",
  },
  {
    title: "Visibility for management",
    body: "Approval backlogs, asset positions and review completion are visible without asking anyone for a status report.",
  },
];

function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Digital Transformation Schedule"
        intro="A multi-phase programme automating core internal processes for an organisation, delivering measurable operational efficiency across HR, assets and workforce management."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>The engagement</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              One schedule, several processes, sequenced by value
            </h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              <p>
                The client operated critical internal processes on paper forms, email approvals and
                departmental spreadsheets. Requests stalled without anyone owning them, asset
                records drifted from reality, and management had no reliable view of either.
              </p>
              <p>
                SkytLabs built a digital transformation schedule: a prioritised sequence of process
                automations, each delivered as a working application and adopted before the next
                began. That kept disruption low while the estate steadily modernised.
              </p>
            </div>
          </div>
          <img
            src={digitalTransformation}
            alt="Connected enterprise systems and automated process flows"
            width={1600}
            height={1104}
            loading="lazy"
            className="w-full rounded-2xl border border-border object-cover"
          />
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>Applications delivered</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
          The systems that came out of the programme
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {MODULES.map((module) => (
            <article key={module.title} className="rounded-xl border border-border bg-card p-8">
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <module.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{module.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{module.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>Outcome</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
          Operational efficiency, made visible
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {OUTCOMES.map((outcome) => (
            <article key={outcome.title} className="border-t-2 border-cyan pt-6">
              <h3 className="text-lg font-semibold">{outcome.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{outcome.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Planning a transformation of your own?"
        body="We can help you sequence it — which processes to automate first, and which to leave alone until the foundations are in place."
      />
    </>
  );
}
