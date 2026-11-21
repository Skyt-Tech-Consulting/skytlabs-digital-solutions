import type { PageContent } from "@/lib/cms/defaults";
import { CtaBanner, PageHero, Section } from "@/components/site-sections";

export function ServicesPage({ content }: { content: PageContent<"services"> }) {
  const { hero, serviceGroups, ctaBanner } = content;
  return (
    <>
      <PageHero {...hero} />

      <Section>
        <div className="space-y-20">
          {serviceGroups.map((group, index) => (
            <div
              key={`${index}-${group.group}`}
              className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]"
            >
              <div>
                <p className="text-sm font-semibold text-primary tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{group.group}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{group.blurb}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {group.services.map((service, i) => (
                  <article
                    key={`${i}-${service.title}`}
                    className="rounded-xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
                  >
                    <span
                      className="brand-gradient-bar block h-1 w-10 rounded-full"
                      aria-hidden="true"
                    />
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

      <CtaBanner {...ctaBanner} />
    </>
  );
}
