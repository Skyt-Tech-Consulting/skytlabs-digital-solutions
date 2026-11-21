import type { PageContent } from "@/lib/cms/defaults";
import { getIcon } from "@/lib/cms/icons";
import { CmsImage, CtaBanner, Eyebrow, PageHero, Section } from "@/components/site-sections";

export function AboutPage({ content }: { content: PageContent<"about"> }) {
  const { hero, whoWeAre, howWeWork, ctaBanner } = content;
  return (
    <>
      <PageHero {...hero} />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>{whoWeAre.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{whoWeAre.title}</h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              {whoWeAre.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <CmsImage
            image={whoWeAre.image}
            width={1408}
            height={1008}
            className="w-full rounded-2xl border border-border object-cover"
          />
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>{howWeWork.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">{howWeWork.title}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {howWeWork.values.map((value, index) => {
            const Icon = getIcon(value.icon);
            return (
              <article
                key={`${index}-${value.title}`}
                className="rounded-xl border border-border bg-card p-8"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <CtaBanner {...ctaBanner} />
    </>
  );
}
