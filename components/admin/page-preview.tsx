'use client'

import { useEffect, useRef, useState } from 'react'
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

  const [zoom, setZoom] = useState<'fit' | 'full'>('fit')
  const frameRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(0.33)
  const [canvasHeight, setCanvasHeight] = useState(0)

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    if (!frame || !canvas) return

    const measure = () => {
      const next = zoom === 'fit' ? Math.min(1, frame.clientWidth / 1280) : 1
      setScale(next)
      setCanvasHeight(canvas.scrollHeight * next)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [zoom])

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
      <div className="flex items-center justify-between gap-2 border-b border-ink/10 bg-sand-50 px-4 py-2.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Whole page preview
          </p>
          <p className="text-[10px] text-ink-muted/80">Live draft · desktop canvas</p>
        </div>
        <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-ink/15 text-[11px]">
          <button
            type="button"
            onClick={() => setZoom('fit')}
            className={`px-2.5 py-1 transition-colors ${
              zoom === 'fit' ? 'bg-brand-900 text-sand-50' : 'bg-white text-ink-soft hover:bg-sand-100'
            }`}
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoom('full')}
            className={`border-l border-ink/15 px-2.5 py-1 transition-colors ${
              zoom === 'full' ? 'bg-brand-900 text-sand-50' : 'bg-white text-ink-soft hover:bg-sand-100'
            }`}
          >
            100%
          </button>
        </div>
      </div>
      <div
        ref={frameRef}
        className={`preview-surface flex-1 bg-sand-50/40 ${
          zoom === 'fit' ? 'overflow-y-auto' : 'overflow-auto'
        }`}
      >
        <div className="relative" style={zoom === 'fit' ? { height: canvasHeight } : undefined}>
          <div
            ref={canvasRef}
            className={zoom === 'fit' ? 'absolute left-0 top-0' : undefined}
            style={{
              width: 1280,
              transform: zoom === 'fit' ? `scale(${scale})` : undefined,
              transformOrigin: 'top left',
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  )
}
