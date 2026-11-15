'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { saveSectionAction } from '@/app/(admin)/admin/actions'
import { EDITABLE_PAGES, type PageDef, type SectionDef, type SectionFields } from '@/lib/site-sections'
import { Field, Input, Notice, Select, Submit, Textarea } from '@/components/admin/ui'

export type SavedSections = Record<string, SectionFields>

function savedKey(pageSlug: string, sectionKey: string) {
  return `${pageSlug}:${sectionKey}`
}

function firstPage(): PageDef {
  const page = EDITABLE_PAGES[0]
  if (!page) throw new Error('No editable pages are configured')
  return page
}

function firstSection(page: PageDef): SectionDef {
  const section = page.sections[0]
  if (!section) throw new Error(`Page ${page.slug} has no sections`)
  return section
}

export function ContentEditor({
  saved,
  initialPage,
  initialSection,
  flash,
}: {
  saved: SavedSections
  initialPage?: string
  initialSection?: string
  flash?: { tone: 'ok' | 'error'; message: string }
}) {
  const startPage = EDITABLE_PAGES.find((page) => page.slug === initialPage) || firstPage()
  const startSection =
    startPage.sections.find((section) => section.key === initialSection) || firstSection(startPage)

  const [pageSlug, setPageSlug] = useState(startPage.slug)
  const [sectionKey, setSectionKey] = useState(startSection.key)

  const page = EDITABLE_PAGES.find((item) => item.slug === pageSlug) || firstPage()
  const section = page.sections.find((item) => item.key === sectionKey) || firstSection(page)

  const stored = saved[savedKey(page.slug, section.key)]
  const [values, setValues] = useState<SectionFields>({ ...section.defaults, ...(stored || {}) })

  useEffect(() => {
    const targetPage = EDITABLE_PAGES.find((item) => item.slug === pageSlug) || firstPage()
    const current =
      targetPage.sections.find((item) => item.key === sectionKey) || firstSection(targetPage)
    const row = saved[savedKey(pageSlug, current.key)]
    setValues({ ...current.defaults, ...(row || {}) })
  }, [pageSlug, sectionKey, saved])

  function update<K extends keyof SectionFields>(key: K, value: SectionFields[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function pickPage(slug: string) {
    const next = EDITABLE_PAGES.find((item) => item.slug === slug)
    if (!next) return
    setPageSlug(slug)
    setSectionKey(firstSection(next).key)
  }

  const hasSavedRow = Boolean(stored)

  return (
    <div className="space-y-5">
      {flash ? (
        <Notice variant={flash.tone === 'ok' ? 'info' : 'warning'}>{flash.message}</Notice>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {EDITABLE_PAGES.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => pickPage(item.slug)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              item.slug === page.slug
                ? 'border-brand-900 bg-brand-900 text-sand-50'
                : 'border-ink/15 bg-white text-ink-soft hover:border-ink/30'
            }`}
          >
            {item.title}
          </button>
        ))}
        <Link
          href={page.path}
          target="_blank"
          className="ml-auto inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
        >
          Open {page.path} <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_340px]">
        <aside className="rounded-xl border border-ink/10 bg-white">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Sections
            </p>
            <span className="text-xs text-ink-muted">{page.sections.length}</span>
          </div>
          <ul className="divide-y divide-ink/5">
            {page.sections.map((item, index) => {
              const row = saved[savedKey(page.slug, item.key)]
              const active = item.key === section.key
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => setSectionKey(item.key)}
                    className={`w-full px-4 py-3 text-left transition ${
                      active ? 'bg-brand-900 text-sand-50' : 'hover:bg-sand-50'
                    }`}
                  >
                    <span
                      className={`mr-2 text-[11px] font-semibold ${
                        active ? 'text-sand-100/70' : 'text-ink-muted'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span
                      className={`mt-1 block truncate text-xs ${
                        active ? 'text-sand-100/60' : 'text-ink-muted'
                      }`}
                    >
                      {row?.heading || item.defaults.heading}
                    </span>
                    <span
                      className={`mt-1 inline-block text-[10px] uppercase tracking-[0.14em] ${
                        active
                          ? 'text-sand-100/50'
                          : row
                            ? row.status === 'draft'
                              ? 'text-ember-700'
                              : 'text-brand-700'
                            : 'text-ink-muted'
                      }`}
                    >
                      {row ? row.status : 'shipped copy'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <form action={saveSectionAction} className="rounded-xl border border-ink/10 bg-white p-5">
          <input type="hidden" name="page_slug" value={page.slug} />
          <input type="hidden" name="section_key" value={section.key} />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                {page.title} · section {page.sections.indexOf(section) + 1} of {page.sections.length}
              </p>
              <h2 className="font-display text-lg text-ink">{section.label}</h2>
              <p className="mt-1 text-xs text-ink-muted">
                Edits appear in the preview as you type. Saving a published section updates the live
                page.
              </p>
            </div>
            {hasSavedRow ? (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                Saved in database
              </span>
            ) : (
              <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                Using shipped copy
              </span>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Eyebrow">
              <Input
                name="eyebrow"
                value={values.eyebrow}
                onChange={(event) => update('eyebrow', event.target.value)}
                placeholder="Kidney care · Since 2024"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading">
                <Input
                  name="heading"
                  value={values.heading}
                  onChange={(event) => update('heading', event.target.value)}
                />
              </Field>
              <Field label="Emphasised ending (italic)">
                <Input
                  name="emphasis"
                  value={values.emphasis}
                  onChange={(event) => update('emphasis', event.target.value)}
                />
              </Field>
            </div>

            <Field label="Body">
              <Textarea
                name="body"
                rows={4}
                value={values.body}
                onChange={(event) => update('body', event.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label">
                <Input
                  name="cta_label"
                  value={values.cta_label}
                  onChange={(event) => update('cta_label', event.target.value)}
                />
              </Field>
              <Field label="Button link">
                <Input
                  name="cta_href"
                  value={values.cta_href}
                  onChange={(event) => update('cta_href', event.target.value)}
                  placeholder="/contact"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Image path or URL (optional)">
                <Input
                  name="image_url"
                  value={values.image_url}
                  onChange={(event) => update('image_url', event.target.value)}
                  placeholder="/SBDC.png"
                />
              </Field>
              <Field label="Image alt text">
                <Input
                  name="image_alt"
                  value={values.image_alt}
                  onChange={(event) => update('image_alt', event.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Order on the page">
                <Input
                  name="sort_order"
                  type="number"
                  value={values.sort_order}
                  onChange={(event) => update('sort_order', event.target.value)}
                />
              </Field>
              <Field label="Status">
                <Select
                  name="status"
                  value={values.status}
                  onChange={(event) =>
                    update('status', event.target.value === 'draft' ? 'draft' : 'published')
                  }
                >
                  <option value="published">Published — visible on the site</option>
                  <option value="draft">Draft — hidden from the site</option>
                </Select>
              </Field>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Submit type="submit">Save section</Submit>
            <span className="text-xs text-ink-muted">
              {values.status === 'draft'
                ? 'Drafts never reach the public page.'
                : 'Published sections replace the shipped copy.'}
            </span>
          </div>
        </form>

        <aside className="rounded-xl border border-ink/10 bg-white p-4 xl:sticky xl:top-4 xl:self-start">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Live preview
            </p>
            <span className="text-[11px] text-brand-700">
              {values.status === 'draft' ? 'Draft' : 'In sync'}
            </span>
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-ink/10">
            {section.kind === 'cta' ? (
              <div className="bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 px-5 py-7 text-center">
                {values.eyebrow ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ember-400">
                    {values.eyebrow}
                  </p>
                ) : null}
                <p className="mt-3 font-display text-[20px] leading-tight text-sand-50">
                  {values.heading}
                  {values.emphasis ? (
                    <span className="italic text-ember-400">{values.emphasis}</span>
                  ) : null}
                </p>
                {values.body ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-sand-100/70">{values.body}</p>
                ) : null}
                {values.cta_label ? (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-ember-500 px-3 py-1.5 text-[12px] font-medium text-white">
                    {values.cta_label}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="bg-sand-50 px-5 py-7">
                {values.eyebrow ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                    {values.eyebrow}
                  </p>
                ) : null}
                <p
                  className={
                    section.kind === 'hero'
                      ? 'mt-3 font-display text-[24px] leading-[1.1] text-ink'
                      : 'mt-3 font-display text-[19px] leading-[1.15] text-ink'
                  }
                >
                  {values.heading}
                  {values.emphasis ? <span className="italic text-brand-700">{values.emphasis}</span> : null}
                </p>
                {values.body ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{values.body}</p>
                ) : null}
                {values.cta_label ? (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-3 py-1.5 text-[12px] font-medium text-sand-50">
                    {values.cta_label}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                ) : null}
                {values.image_url ? (
                  <p className="mt-3 truncate text-[11px] text-ink-muted">Image: {values.image_url}</p>
                ) : null}
              </div>
            )}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
            The published page keeps its own layout; this panel mirrors the copy so you can judge
            length before saving.
          </p>
        </aside>
      </div>
    </div>
  )
}
