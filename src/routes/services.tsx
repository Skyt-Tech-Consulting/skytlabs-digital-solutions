import { createFileRoute } from "@tanstack/react-router";
import { CtaBanner, PageHero, Section } from "@/components/site-sections";
import { ALL_SERVICES, SERVICE_GROUPS } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "IT Consulting Services — SkytLabs Limited, Lagos" },
      {
        name: "description",
        content:
          "Software development, business automation, IT strategy, enterprise architecture, cloud, cybersecurity, data, ERP, QA and DevOps services from SkytLabs Limited.",
      },
      { property: "og:title", content: "IT Consulting Services — SkytLabs Limited" },
      {
        property: "og:description",
        content:
          "Ten consulting disciplines delivered by a single accountable Nigerian technology partner.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "SkytLabs Limited services",
          itemListElement: ALL_SERVICES.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.title,
          })),
        }),
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Ten disciplines that cover the full technology lifecycle"
        intro="From the first strategy workshop to the on-call rotation that keeps a platform available, SkytLabs covers the whole path — with one team accountable for the outcome."
      />

      <Section>
        <div className="space-y-20">
          {SERVICE_GROUPS.map((group, index) => (
            <div key={group.id} className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
              <div>
                <p className="text-sm font-semibold text-primary tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{group.group}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{group.blurb}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {group.services.map((service) => (
                  <article
                    key={service.title}
                    className="rounded-xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
                  >
                    <span className="brand-gradient-bar block h-1 w-10 rounded-full" aria-hidden="true" />
                    <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Not sure which capability you need?"
        body="Describe the problem in plain terms. We will tell you which of these disciplines applies — and which you can skip."
      />
    </>
  );
}
