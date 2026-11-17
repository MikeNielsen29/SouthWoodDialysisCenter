'use client'

import type { SectionFields } from '@/lib/site-sections'
import { Section as HeroSection } from '@/components/sections/herosection'
import { PageHeader } from '@/components/sections/pageheader'
import { GallerySection } from '@/components/sections/gallerysection'
import { ServicesSection } from '@/components/sections/servicessection'
import { AboutSection } from '@/components/sections/aboutsection'
import { ProcessSection } from '@/components/sections/processsection'
import { TestimonialsSection } from '@/components/sections/testimonialssection'
import { NewsSection } from '@/components/sections/newsection'
import { CtaSection } from '@/components/sections/ctasection'
import { ContactSection } from '@/components/sections/contactsection'

export interface PreviewData {
  services: { title: string; summary: string; icon: string }[]
  news: { title: string; excerpt: string; published_at: string }[]
  testimonials: { display_name: string; rating: string; body: string; created_at: string }[]
}

function HeaderBlock({ values }: { values?: SectionFields }) {
  return (
    <PageHeader
      eyebrow={values?.eyebrow || 'About us'}
      title={values?.heading || 'Kidney care with a '}
      emphasis={values?.emphasis || 'human pace.'}
      lead={values?.body || ''}
    />
  )
}

export function PagePreview({
  slug,
  values,
  data,
}: {
  slug: string
  values: Record<string, SectionFields>
  data: PreviewData
}) {
  const rated = data.testimonials
    .map((item) => Number(item.rating))
    .filter((value) => Number.isFinite(value) && value > 0)
  const rating = rated.length ? rated.reduce((total, value) => total + value, 0) / rated.length : 0

  const gallery = <GallerySection content={values.gallery} />

  let body: React.ReactNode = null

  if (slug === 'home') {
    body = (
      <>
        <HeroSection
          content={values.hero}
          extraContent={values.hero_extra}
          statsContent={values.stats}
          rating={rating}
        />
        {gallery}
        <ServicesSection items={data.services} content={values.services} />
        <AboutSection
          content={values.about}
          valuesContent={values.values}
          promiseContent={values.promise}
          statsContent={values.about_stats}
        />
        <ProcessSection content={values.process} stepsContent={values.steps} />
        <TestimonialsSection items={data.testimonials} content={values.stories} />
        <NewsSection articles={data.news} content={values.news} />
        <CtaSection content={values.cta} />
      </>
    )
  } else if (slug === 'about') {
    body = (
      <>
        <HeaderBlock values={values.header} />
        {gallery}
        <AboutSection
          content={values.about}
          valuesContent={values.values}
          promiseContent={values.promise}
          statsContent={values.about_stats}
        />
        <TestimonialsSection items={data.testimonials} content={values.stories} />
        <CtaSection content={values.cta} />
      </>
    )
  } else if (slug === 'services') {
    body = (
      <>
        <HeaderBlock values={values.header} />
        {gallery}
        <ServicesSection items={data.services} content={values.services} />
        <ProcessSection content={values.process} stepsContent={values.steps} />
        <CtaSection content={values.cta} />
      </>
    )
  } else if (slug === 'news') {
    body = (
      <>
        <HeaderBlock values={values.header} />
        {gallery}
        <NewsSection articles={data.news} content={values.news} />
        <CtaSection content={values.cta} />
      </>
    )
  } else if (slug === 'contact') {
    body = (
      <>
        <HeaderBlock values={values.header} />
        {gallery}
        <ContactSection content={values.contact} formContent={values.form} />
      </>
    )
  } else {
    body = (
      <section className="shell py-12">
        <p className="eyebrow">Footer tagline</p>
        <p className="lead mt-4 max-w-2xl">
          {values.footer?.body ||
            'Calm, comprehensive kidney care for our community — with the same care team at every visit.'}
        </p>
      </section>
    )
  }

  return (
    <div className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-xl border border-ink/10 bg-white lg:col-span-2 xl:sticky xl:top-4 xl:col-span-1 xl:self-start">
      <div className="flex items-center justify-between border-b border-ink/10 bg-sand-50 px-4 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Whole page preview
        </p>
        <span className="text-[11px] text-ink-muted">Updates as you type</span>
      </div>
      <div className="preview-surface flex-1 overflow-y-auto bg-sand-50/40">{body}</div>
    </div>
  )
}
