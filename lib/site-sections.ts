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

export type SectionKind =
  | 'hero'
  | 'header'
  | 'cta'
  | 'gallery'
  | 'about'
  | 'process'
  | 'services'
  | 'stories'
  | 'news'
  | 'contact'
  | 'values'
  | 'promise'
  | 'steps'
  | 'form'
  | 'footer'

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
      section('gallery', 'Image gallery (optional)', 'gallery', {
        body: 'Photos of the centre, the team and the stations.',
        sort_order: '2',
      }),
      section('about', 'About Southwood block', 'about', {
        eyebrow: 'About Southwood',
        heading: 'A neighbourhood centre with',
        emphasis: 'hospital-grade care.',
        body: 'Southwood Dialysis Center opened in 2024 with a simple idea: kidney care should feel calm, familiar, and close to home. Three modern stations, a small clinical team, and schedules built around patients rather than queues.\n\nFrom your first assessment to your weekly sessions, the same nephrologists and technicians follow your progress — so nothing about your care gets lost between visits.\n\nLeave a blank line between paragraphs.',
        sort_order: '3',
      }),
      section('services', 'Services intro', 'services', {
        eyebrow: 'What we offer',
        heading: 'Complete kidney care,',
        emphasis: 'under one roof.',
        body: 'Six core programmes, one care team — designed around how treatment actually fits into your week.',
        sort_order: '4',
      }),
      section('stories', 'Patient stories intro', 'stories', {
        eyebrow: 'Patient stories',
        heading: 'In their own words.',
        body: 'Real feedback from people who sit in our chairs every week.',
        sort_order: '5',
      }),
      section('news', 'Latest news intro', 'news', {
        eyebrow: 'Latest news',
        heading: 'News & updates.',
        sort_order: '6',
      }),
      section('values', 'About: value cards', 'values', {
        body: 'Quality | Protocol-driven care and rigorous water safety checks.\nCompassion | Small team, familiar faces, unhurried sessions.\nClarity | Plain-language explanations at every step.',
        sort_order: '4',
      }),
      section('promise', 'About: promise card', 'promise', {
        eyebrow: 'Our promise',
        heading: 'Care that respects your time, your privacy, and your dignity.',
        body: 'Nephrologist-led treatment plans\nCertified dialysis technicians on every shift\nEvening and early-morning slots',
        sort_order: '5',
      }),
      section('process', 'How it works block', 'process', {
        eyebrow: 'How it works',
        heading: 'Three steps to',
        emphasis: 'your first session.',
        body: 'No referrals required to start the conversation. We will walk you through insurance, transport, and scheduling before you commit to anything.',
        cta_label: 'Talk to our care team',
        cta_href: '/contact',
        sort_order: '6',
      }),
      section('steps', 'How it works: step cards', 'steps', {
        body: 'Book a consultation | Call us or send a request online. We confirm your slot within one working day and explain what to bring.\nAssessment & plan | A nephrologist reviews your history, orders labs if needed, and designs a schedule that fits your week.\nStart treatment | Meet your care team, settle into your station, and begin sessions with the same faces each visit.',
        sort_order: '7',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '8',
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
      section('gallery', 'Image gallery (optional)', 'gallery', {
        body: 'Photos of the centre, the team and the stations.',
        sort_order: '2',
      }),
      section('about', 'About Southwood block', 'about', {
        eyebrow: 'About Southwood',
        heading: 'A neighbourhood centre with',
        emphasis: 'hospital-grade care.',
        body: 'Southwood Dialysis Center opened in 2024 with a simple idea: kidney care should feel calm, familiar, and close to home. Three modern stations, a small clinical team, and schedules built around patients rather than queues.\n\nFrom your first assessment to your weekly sessions, the same nephrologists and technicians follow your progress — so nothing about your care gets lost between visits.\n\nLeave a blank line between paragraphs.',
        sort_order: '3',
      }),
      section('stories', 'Patient stories intro', 'stories', {
        eyebrow: 'Patient stories',
        heading: 'In their own words.',
        body: 'Real feedback from people who sit in our chairs every week.',
        sort_order: '4',
      }),
      section('values', 'About: value cards', 'values', {
        body: 'Quality | Protocol-driven care and rigorous water safety checks.\nCompassion | Small team, familiar faces, unhurried sessions.\nClarity | Plain-language explanations at every step.',
        sort_order: '5',
      }),
      section('promise', 'About: promise card', 'promise', {
        eyebrow: 'Our promise',
        heading: 'Care that respects your time, your privacy, and your dignity.',
        body: 'Nephrologist-led treatment plans\nCertified dialysis technicians on every shift\nEvening and early-morning slots',
        sort_order: '6',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '7',
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
      section('gallery', 'Image gallery (optional)', 'gallery', {
        body: 'Photos of the centre, the team and the stations.',
        sort_order: '2',
      }),
      section('services', 'Services intro', 'services', {
        eyebrow: 'What we offer',
        heading: 'Complete kidney care,',
        emphasis: 'under one roof.',
        body: 'Six core programmes, one care team — designed around how treatment actually fits into your week.',
        sort_order: '3',
      }),
      section('process', 'How it works block', 'process', {
        eyebrow: 'How it works',
        heading: 'Three steps to',
        emphasis: 'your first session.',
        body: 'No referrals required to start the conversation. We will walk you through insurance, transport, and scheduling before you commit to anything.',
        cta_label: 'Talk to our care team',
        cta_href: '/contact',
        sort_order: '4',
      }),
      section('steps', 'How it works: step cards', 'steps', {
        body: 'Book a consultation | Call us or send a request online. We confirm your slot within one working day and explain what to bring.\nAssessment & plan | A nephrologist reviews your history, orders labs if needed, and designs a schedule that fits your week.\nStart treatment | Meet your care team, settle into your station, and begin sessions with the same faces each visit.',
        sort_order: '5',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '6',
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
      section('gallery', 'Image gallery (optional)', 'gallery', {
        body: 'Photos of the centre, the team and the stations.',
        sort_order: '2',
      }),
      section('news', 'Latest news intro', 'news', {
        eyebrow: 'Latest news',
        heading: 'News & updates.',
        sort_order: '3',
      }),
      section('cta', 'Closing call to action', 'cta', {
        eyebrow: 'Get started',
        heading: 'Ready to talk about',
        emphasis: ' your treatment plan?',
        body: 'Tell us a little about your situation and we will call you back within one working day. No referrals needed to start the conversation.',
        cta_label: 'Book an appointment',
        cta_href: '/contact',
        sort_order: '4',
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
      section('gallery', 'Image gallery (optional)', 'gallery', {
        body: 'Photos of the centre, the team and the stations.',
        sort_order: '2',
      }),
      section('contact', 'Contact block', 'contact', {
        heading: 'Talk to a real person.',
        body: 'Call us during opening hours, or send a request and we will get back to you within one working day. No referral is needed to ask a question.',
        cta_label: 'Send request',
        sort_order: '3',
      }),
      section('form', 'Request form', 'form', {
        heading: 'Request an appointment',
        body: 'Send it online and our team will call you back within one working day.',
        cta_label: 'Send request',
        sort_order: '4',
      }),
    ],
  },
  {
    slug: 'global',
    title: 'Header & footer',
    path: '/',
    sections: [
      section('footer', 'Footer tagline', 'footer', {
        body: 'Calm, comprehensive kidney care for our community — with the same care team at every visit.',
        sort_order: '1',
      }),
    ],
  },
]

export function findPage(slug: string): PageDef | undefined {
  return EDITABLE_PAGES.find((page) => page.slug === slug)
}
