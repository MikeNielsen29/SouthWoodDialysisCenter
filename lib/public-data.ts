import { callSheets, isSheetsConfigured } from './sheets/client'

export interface PublicService {
  title: string
  summary: string
  icon: string
}

export interface PublicArticle {
  title: string
  excerpt: string
  body: string
  published_at: string
  cover_url: string
}

export interface PublicTestimonial {
  display_name: string
  rating: string
  body: string
  created_at: string
}

export interface PublicSettings {
  hotline: string
  email: string
  address: string
  hours: string
  facebook: string
  instagram: string
  x: string
  linkedin: string
}

export interface PublicContent {
  services: PublicService[]
  news: PublicArticle[]
  testimonials: PublicTestimonial[]
  settings: PublicSettings
}

const EMPTY: PublicContent = {
  services: [],
  news: [],
  testimonials: [],
  settings: {
    hotline: '',
    email: '',
    address: '',
    hours: '',
    facebook: '',
    instagram: '',
    x: '',
    linkedin: '',
  },
}

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

function records(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object'
  )
}

/**
 * Published content for the public pages. Every list may be empty; the
 * components then keep rendering the shipped copy, never an empty state.
 */
export async function getPublicContent(): Promise<PublicContent> {
  if (!isSheetsConfigured()) return EMPTY

  try {
    const raw = await callSheets<Record<string, unknown>>('public.content', {})
    if (!raw || typeof raw !== 'object') return EMPTY

    const services = records(raw.services)
      .map((row) => ({
        title: text(row.title).trim(),
        summary: text(row.summary).trim(),
        icon: text(row.icon).trim(),
      }))
      .filter((service) => service.title)

    const news = records(raw.news)
      .map((row) => ({
        title: text(row.title).trim(),
        excerpt: text(row.excerpt).trim(),
        body: text(row.body).trim(),
        published_at: text(row.published_at),
        cover_url: text(row.cover_url),
      }))
      .filter((article) => article.title)

    const testimonials = records(raw.testimonials)
      .map((row) => ({
        display_name: text(row.display_name).trim(),
        rating: text(row.rating) || '5',
        body: text(row.body).trim(),
        created_at: text(row.created_at),
      }))
      .filter((item) => item.body)

    const settingsRaw =
      raw.settings && typeof raw.settings === 'object'
        ? (raw.settings as Record<string, unknown>)
        : {}

    return {
      services,
      news,
      testimonials,
      settings: {
        hotline: text(settingsRaw.hotline),
        email: text(settingsRaw.email),
        address: text(settingsRaw.address),
        hours: text(settingsRaw.hours),
        facebook: text(settingsRaw.facebook),
        instagram: text(settingsRaw.instagram),
        x: text(settingsRaw.x),
        linkedin: text(settingsRaw.linkedin),
      },
    }
  } catch {
    return EMPTY
  }
}

export function formatArticleDate(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
