import type { PageContent } from "@/lib/cms/defaults";
import { getIcon } from "@/lib/cms/icons";
import { CmsLink } from "@/components/site-context";
import {
  CmsImage,
  CtaBanner,
  DotList,
  Eyebrow,
  PageHero,
  Section,
} from "@/components/site-sections";

export function ProductsPage({ content }: { content: PageContent<"products"> }) {
  const { hero, problem, capabilities, ctaBanner } = content;
  return (
    <>
      <PageHero {...hero} />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <CmsImage
            image={problem.image}
            width={1600}
            height={1104}
            className="w-full rounded-2xl border border-border object-cover"
          />
          <div>
            <Eyebrow>{problem.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{problem.title}</h2>
            <div className="mt-6 space-y-5 text-muted-foreground">
              {problem.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <DotList items={problem.useCases} />
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <Eyebrow>{capabilities.eyebrow}</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">{capabilities.title}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.features.map((feature, index) => {
            const Icon = getIcon(feature.icon);
            return (
              <article
                key={`${index}-${feature.title}`}
                className="rounded-xl border border-border bg-card p-8"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </article>
            );
          })}
        </div>
        {capabilities.cta.label && (
          <CmsLink
            href={capabilities.cta.href}
            className="mt-12 inline-flex items-center rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {capabilities.cta.label}
          </CmsLink>
        )}
      </Section>

      <CtaBanner {...ctaBanner} />
    </>
  );
}
