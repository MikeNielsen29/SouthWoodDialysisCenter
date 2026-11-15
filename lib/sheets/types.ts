export type Role = 'Super Admin' | 'Admin' | 'Page Editor' | 'Patient'

export type AuditEntry = {
  id: string
  actor_id: string
  actor_role: string
  action: string
  entity: string
  entity_id: string
  meta_json: string
  ip_hash: string
  created_at: string
}

export const AuditEntrySchema = {
  array() {
    return AuditEntrySchema
  },
  id: 'string',
  actor_id: 'string',
  actor_role: 'string',
  action: 'string',
  entity: 'string',
  entity_id: 'string',
  meta_json: 'string',
  ip_hash: 'string',
  created_at: 'string',
}

export const InquirySchema = {
  array() {
    return InquirySchema
  },
  id: 'string',
  name: 'string',
  subject: 'string',
  message: 'string',
  status: 'string',
  created_at: 'string',
  email: 'string',
  phone: 'string',
  notes: 'string',
  handled_by: 'string',
}

export const NewsPostSchema = {
  array() {
    return NewsPostSchema
  },
  id: 'string',
  slug: 'string',
  title: 'string',
  excerpt: 'string',
  body: 'string',
  cover_url: 'string',
  cover_alt: 'string',
  published_at: 'string',
  status: 'string',
}

export const ServiceSchema = {
  array() {
    return ServiceSchema
  },
  id: 'string',
  slug: 'string',
  title: 'string',
  summary: 'string',
  icon: 'string',
  sort_order: 'string',
  status: 'string',
}

export const TestimonialSchema = {
  array() {
    return TestimonialSchema
  },
  id: 'string',
  patient_cn: 'string',
  display_name: 'string',
  rating: 'number',
  body: 'string',
  status: 'string',
  created_at: 'string',
  moderated_by: 'string',
  moderated_at: 'string',
}

export const SiteContentSchema = {
  pages: 'object',
  sections: 'object',
  services: 'object',
  news: 'object',
  testimonials: 'object',
  inquiries: 'object',
  settings: 'object',
}

export const PageSchema = {
  array() {
    return PageSchema
  },
  id: 'string',
  slug: 'string',
  title: 'string',
  meta_title: 'string',
  meta_description: 'string',
  h1: 'string',
  og_image: 'string',
  status: 'string',
  body: 'string',
}

export const SectionSchema = {
  array() {
    return SectionSchema
  },
  id: 'string',
  page_slug: 'string',
  section_key: 'string',
  sort_order: 'string',
  eyebrow: 'string',
  heading: 'string',
  body: 'string',
  cta_label: 'string',
  cta_href: 'string',
  status: 'string',
}

export const SettingsSchema = {
  hotline: 'string',
  address: 'string',
  hours: 'string',
  email: 'string',
  facebook: 'string',
  instagram: 'string',
  x: 'string',
  linkedin: 'string',
  disclaimer: 'string',
  consentVersion: 'string',
}

export const UserSchema = {
  array() {
    return UserSchema
  },
  id: 'string',
  cn: 'string',
  full_name: 'string',
  email: 'string',
  phone: 'string',
  role: 'string',
  is_active: 'boolean',
  created_at: 'string',
}
