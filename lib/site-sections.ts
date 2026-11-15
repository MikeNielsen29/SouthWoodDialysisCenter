/**
 * Every public page that can be edited from /admin/content.
 *
 * The `defaults` here are the shipped copy: the public site renders them when
 * the database has no published row for that section (or the backend is down).
 * The editor shows the same defaults so a first save starts from real copy.
 */

export type SectionFields = {
  eyebrow: string
  heading: string
  emphasis: string
  body: string
  image_url: string
  image_alt: string
  cta_label: string
  cta_href: string
  sort_order: string
  status: 'published' | 'draft'
}

export type SectionKind = 'hero' | 'header' | 'cta'

export type SectionDef = {
  key: string
  label: string
  kind: SectionKind
  defaults: SectionFields
}

export type PageDef = {
  slug: string
  title: string
  path: string
  sections: SectionDef[]
}

const empty: SectionFields = {
  eyebrow: '',
  heading: '',
  emphasis: '',
  body: '',
  image_url: '',
  image_alt: '',
  cta_label: '',
  cta_href: '',
  sort_order: '0',
  status: 'published',
}

function section(
  key: string,
  label: string,
  kind: SectionKind,
  defaults: Partial<SectionFields>
): SectionDef {
  return { key, label, kind, defaults: { ...empty, ...defaults } }
}

export const EDITABLE_PAGES: PageDef[] = [
  {
    slug: 'home',
    title: 'Homepage',
    path: '/',
    sections: [
      section('hero', 'Hero', 'hero', {
        eyebrow: 'Kidney care · Since 2024',
        heading: 'Dialysis care that',
        emphasis: 'feels personal.',
        body: 'Compassionate, state-of-the-art dialysis treatment in a calm environment. Our nephrologists and certified technicians focus on one thing — helping you feel like yourself again.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '1',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '2',
      }),
    ],
  },
  {
    slug: 'about',
    title: 'About',
    path: '/about',
    sections: [
      section('header', 'Page header', 'header', {
        eyebrow: 'About us',
        heading: 'Kidney care with a ',
        emphasis: 'human pace.',
        body: 'A small team, three modern stations, and a schedule built around patients rather than queues.',
        sort_order: '1',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '2',
      }),
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    path: '/services',
    sections: [
      section('header', 'Page header', 'header', {
        eyebrow: 'Services',
        heading: 'Treatment that fits ',
        emphasis: 'your week.',
        body: 'From in-centre hemodialysis to at-home programmes, each service comes with the same care team and the same clear answers.',
        sort_order: '1',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '2',
      }),
    ],
  },
  {
    slug: 'news',
    title: 'News',
    path: '/news',
    sections: [
      section('header', 'Page header', 'header', {
        eyebrow: 'News',
        heading: "What's happening at ",
        emphasis: 'Southwood.',
        body: 'Centre updates, patient workshops, and practical health notes from our clinical team.',
        sort_order: '1',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '2',
      }),
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    path: '/contact',
    sections: [
      section('header', 'Page header', 'header', {
        eyebrow: 'Contact',
        heading: 'Book a visit or ',
        emphasis: 'ask us anything.',
        body: 'We answer the phone during opening hours and reply to requests within one working day.',
        sort_order: '1',
      }),
    ],
  },
]

export function findPage(slug: string): PageDef | undefined {
  return EDITABLE_PAGES.find((page) => page.slug === slug)
}
