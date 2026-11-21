import { ArrowRight } from "lucide-react";
import type { PageContent } from "@/lib/cms/defaults";
import { getIcon } from "@/lib/cms/icons";
import { CmsLink } from "@/components/site-context";
import { CmsImage, CtaBanner, DotList, Eyebrow, Section } from "@/components/site-sections";

type ServiceGroups = PageContent<"services">["serviceGroups"];

export function HomePage({
  content,
  serviceGroups,
}: {
  content: PageContent<"home">;
  serviceGroups: ServiceGroups;
}) {
  const { hero, whatWeDo, whySkytlabs, product, ctaBanner } = content;
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <CmsImage
          image={hero.backgroundImage}
          width={1920}
          height={1088}
          eager
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8 lg:py-40">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-cyan uppercase">
            <span className="brand-gradient-bar h-px w-8" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="mt-7 max-w-4xl text-4xl leading-[1.03] font-bold sm:text-5xl lg:text-7xl">
            {hero.titleLead}{" "}
            {hero.titleHighlight && (
              <span className="brand-gradient-text">{hero.titleHighlight}</span>
            )}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-navy-foreground/75">
            {hero.intro}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {hero.primaryCta.label && (
              <CmsLink
                href={hero.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3.5 text-sm font-semibold text-cyan-foreground transition-opacity hover:opacity-90"
              >
                {hero.primaryCta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </CmsLink>
            )}
            {hero.secondaryCta.label && (
              <CmsLink
                href={hero.secondaryCta.href}
                className="inline-flex items-center rounded-md border border-navy-foreground/25 px-6 py-3.5 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy-foreground/10"
              >
                {hero.secondaryCta.label}
              </CmsLink>
            )}
          </div>
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>{whatWeDo.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{whatWeDo.title}</h2>
            <p className="mt-4 text-muted-foreground">{whatWeDo.intro}</p>
          </div>
          {whatWeDo.link.label && (
            <CmsLink
              href={whatWeDo.link.href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {whatWeDo.link.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </CmsLink>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {whatWeDo.highlights.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <article
                key={`${index}-${item.title}`}
                className="rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>{whySkytlabs.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{whySkytlabs.title}</h2>
            <p className="mt-4 text-muted-foreground">{whySkytlabs.intro}</p>
            <dl className="mt-10 space-y-8">
              {whySkytlabs.differentiators.map((item, index) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={`${index}-${item.title}`} className="flex gap-5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="font-semibold">{item.title}</dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {serviceGroups.map((group, index) => (
              <div
                key={`${index}-${group.group}`}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="text-sm font-semibold text-primary">{group.group}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {group.services.map((service, i) => (
                    <li key={`${i}-${service.title}`}>{service.title}</li>
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
            <Eyebrow>{product.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{product.title}</h2>
            <p className="mt-4 text-muted-foreground">{product.body}</p>
            <DotList items={product.points} />
            {product.cta.label && (
              <CmsLink
                href={product.cta.href}
                className="mt-9 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {product.cta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </CmsLink>
            )}
          </div>
          <div className="order-1 lg:order-2">
            <CmsImage
              image={product.image}
              width={1600}
              height={1104}
              className="w-full rounded-2xl border border-border object-cover"
            />
          </div>
        </div>
      </Section>

      <CtaBanner {...ctaBanner} />
    </>
  );
}
