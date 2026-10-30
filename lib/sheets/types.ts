import { z } from 'zod'

/**
 * Data contract for the Google Sheets backend ("CloudBase DB").
 *
 * Sheets returns everything as strings, so these schemas are deliberately
 * permissive on input and strict on shape: unknown columns are ignored, and
 * every value is normalised before it reaches the UI (see lib/content.ts).
 */

export const PublishStatusSchema = z.enum(['draft', 'published'])
export const TestimonialStatusSchema = z.enum(['Pending', 'Approved', 'Rejected'])
export const InquiryStatusSchema = z.enum(['New', 'Read', 'Closed'])
export const RoleSchema = z.enum(['Super Admin', 'Admin', 'Page Editor', 'Patient'])
export const AppointmentStatusSchema = z.enum([
  'Requested',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No-show',
])
export const QueueStateSchema = z.enum(['Waiting', 'Ongoing', 'Completed'])
export const BillingStatusSchema = z.enum(['Unpaid', 'Paid', 'Partial', 'Void'])
export const FileCategorySchema = z.enum(['lab', 'image'])
export const FileStatusSchema = z.enum(['Pending', 'Released', 'Archived'])

export type PublishStatus = z.infer<typeof PublishStatusSchema>
export type TestimonialStatus = z.infer<typeof TestimonialStatusSchema>
export type InquiryStatus = z.infer<typeof InquiryStatusSchema>
export type Role = z.infer<typeof RoleSchema>
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>
export type QueueState = z.infer<typeof QueueStateSchema>
export type BillingStatus = z.infer<typeof BillingStatusSchema>

const text = z.string().trim()

/* ------------------------------------------------------------------ */
/* ContentDB                                                           */
/* ------------------------------------------------------------------ */

export const PageSchema = z.object({
  id: text,
  slug: text,
  title: text.default(''),
  meta_title: text.default(''),
  meta_description: text.default(''),
  h1: text.default(''),
  og_image: text.default(''),
  status: PublishStatusSchema.default('published'),
  updated_at: text.default(''),
  updated_by: text.default(''),
})
export type Page = z.infer<typeof PageSchema>

export const SectionSchema = z.object({
  id: text,
  page_slug: text,
  section_key: text,
  sort_order: text.default('0'),
  eyebrow: text.default(''),
  heading: text.default(''),
  emphasis: text.default(''),
  body: text.default(''),
  image_url: text.default(''),
  image_alt: text.default(''),
  cta_label: text.default(''),
  cta_href: text.default(''),
  status: PublishStatusSchema.default('published'),
})
export type Section = z.infer<typeof SectionSchema>

export const ServiceSchema = z.object({
  id: text,
  slug: text,
  title: text,
  summary: text.default(''),
  icon: text.default(''),
  sort_order: text.default('0'),
  status: PublishStatusSchema.default('published'),
})
export type Service = z.infer<typeof ServiceSchema>

export const NewsPostSchema = z.object({
  id: text,
  slug: text,
  title: text,
  excerpt: text.default(''),
  body: text.default(''),
  cover_url: text.default(''),
  cover_alt: text.default(''),
  published_at: text.default(''),
  status: PublishStatusSchema.default('published'),
})
export type NewsPost = z.infer<typeof NewsPostSchema>

export const TestimonialSchema = z.object({
  id: text,
  patient_cn: text.default(''),
  display_name: text.default(''),
  rating: text.default('5'),
  body: text.default(''),
  status: TestimonialStatusSchema.default('Pending'),
  created_at: text.default(''),
  moderated_by: text.default(''),
  moderated_at: text.default(''),
})
export type Testimonial = z.infer<typeof TestimonialSchema>

export const SiteSettingsSchema = z.object({
  hotline: text.default(''),
  address: text.default(''),
  hours: text.default(''),
  map_lat: text.default(''),
  map_lng: text.default(''),
  facebook: text.default(''),
  instagram: text.default(''),
  x: text.default(''),
  linkedin: text.default(''),
  gsc_verification: text.default(''),
  disclaimer: text.default(''),
  consent_version: text.default('1'),
})
export type SiteSettings = z.infer<typeof SiteSettingsSchema>

/** Shape returned by `public.getContent` (Phase 2). */
export const SiteContentSchema = z.object({
  pages: z.array(PageSchema).default([]),
  sections: z.array(SectionSchema).default([]),
  services: z.array(ServiceSchema).default([]),
  news: z.array(NewsPostSchema).default([]),
  testimonials: z.array(TestimonialSchema).default([]),
  settings: SiteSettingsSchema.partial().default({}),
})
export type SiteContent = z.infer<typeof SiteContentSchema>

/* ------------------------------------------------------------------ */
/* SecurityDB                                                          */
/* ------------------------------------------------------------------ */

export const UserSchema = z.object({
  id: text,
  cn: text,
  full_name: text.default(''),
  email: text.default(''),
  phone: text.default(''),
  role: RoleSchema,
  otp_required: text.default('TRUE'),
  is_active: text.default('TRUE'),
  must_change_password: text.default('FALSE'),
  failed_count: text.default('0'),
  locked_until: text.default(''),
  last_login_at: text.default(''),
  created_at: text.default(''),
})
export type User = z.infer<typeof UserSchema>

/** Never leaves the server: password hashes are not part of any client payload. */
export const UserRecordSchema = UserSchema.extend({ password_hash: text })
export type UserRecord = z.infer<typeof UserRecordSchema>

export const AuditEntrySchema = z.object({
  id: text.default(''),
  actor_id: text.default(''),
  actor_role: text.default(''),
  action: text,
  entity: text.default(''),
  entity_id: text.default(''),
  meta_json: text.default(''),
  ip_hash: text.default(''),
  created_at: text.default(''),
})
export type AuditEntry = z.infer<typeof AuditEntrySchema>

/* ------------------------------------------------------------------ */
/* Operational                                                         */
/* ------------------------------------------------------------------ */

export const AppointmentSchema = z.object({
  id: text,
  patient_cn: text,
  scheduled_at: text,
  duration_min: text.default('180'),
  chair: text.default(''),
  status: AppointmentStatusSchema.default('Requested'),
  notes: text.default(''),
  reminder_sent_at: text.default(''),
  created_at: text.default(''),
  updated_at: text.default(''),
})
export type Appointment = z.infer<typeof AppointmentSchema>

export const QueueEntrySchema = z.object({
  id: text,
  appointment_id: text.default(''),
  patient_cn: text,
  state: QueueStateSchema.default('Waiting'),
  position: text.default('0'),
  started_at: text.default(''),
  completed_at: text.default(''),
  updated_at: text.default(''),
})
export type QueueEntry = z.infer<typeof QueueEntrySchema>

export const BillingRecordSchema = z.object({
  id: text,
  patient_cn: text,
  invoice_no: text.default(''),
  description: text.default(''),
  amount_php: text.default('0'),
  status: BillingStatusSchema.default('Unpaid'),
  issued_at: text.default(''),
  paid_at: text.default(''),
  notes: text.default(''),
})
export type BillingRecord = z.infer<typeof BillingRecordSchema>

export const ShiftSchema = z.object({
  id: text,
  staff_cn: text,
  starts_at: text,
  ends_at: text,
  station: text.default(''),
  notes: text.default(''),
  created_at: text.default(''),
})
export type Shift = z.infer<typeof ShiftSchema>

/* ------------------------------------------------------------------ */
/* FilesDB + system                                                    */
/* ------------------------------------------------------------------ */

export const FileRecordSchema = z.object({
  id: text,
  patient_cn: text,
  title: text,
  category: FileCategorySchema.default('lab'),
  telegram_file_id: text,
  telegram_message_id: text.default(''),
  mime: text.default('application/pdf'),
  size_bytes: text.default('0'),
  checksum_sha256: text.default(''),
  encrypted: text.default('TRUE'),
  uploaded_by: text.default(''),
  uploaded_at: text.default(''),
  released_at: text.default(''),
  status: FileStatusSchema.default('Pending'),
})
export type FileRecord = z.infer<typeof FileRecordSchema>

export const HealthSchema = z.object({
  schemaVersion: z.string().nullable(),
  installedAt: z.string().nullable(),
  lastSetupAt: z.string().nullable(),
  lastBackupAt: z.string().nullable(),
  spreadsheet: z.string(),
  timeZone: z.string(),
  tabs: z.record(z.number().nullable()),
  missingTabs: z.array(z.string()),
  configured: z.object({
    sharedSecret: z.boolean(),
    hashPepper: z.boolean(),
    telegramToken: z.boolean(),
    telegramChat: z.boolean(),
  }),
  adminConfigured: z.boolean(),
})
export type Health = z.infer<typeof HealthSchema>
