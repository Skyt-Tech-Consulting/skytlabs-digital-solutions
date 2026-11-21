import type { PageContent } from "@/lib/cms/defaults";
import { getIcon } from "@/lib/cms/icons";
import { CmsImage, CtaBanner, Eyebrow, PageHero, Section } from "@/components/site-sections";

export function ProjectsPage({ content }: { content: PageContent<"projects"> }) {
  const { hero, engagement, applications, outcome, ctaBanner } = content;
  return (
    <>
      <PageHero {...hero} />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>{engagement.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{engagement.title}</h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              {engagement.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <CmsImage
            image={engagement.image}
            width={1600}
            height={1104}
            className="w-full rounded-2xl border border-border object-cover"
          />
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>{applications.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">{applications.title}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {applications.modules.map((module, index) => {
            const Icon = getIcon(module.icon);
            return (
              <article
                key={`${index}-${module.title}`}
                className="rounded-xl border border-border bg-card p-8"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{module.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{module.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section>
        <Eyebrow>{outcome.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">{outcome.title}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {outcome.outcomes.map((item, index) => (
            <article key={`${index}-${item.title}`} className="border-t-2 border-cyan pt-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <CtaBanner {...ctaBanner} />
    </>
  );
}
