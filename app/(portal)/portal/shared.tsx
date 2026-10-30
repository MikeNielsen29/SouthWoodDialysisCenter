'use client'

import { useFormStatus } from 'react-dom'
import { Clock, FileText, Phone, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold">
            SD
          </span>
          <div>
            <p className="font-display text-sm text-ink">Southwood Patient Portal</p>
            <p className="text-[11px] text-ink-muted">Signed in as a patient</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink-soft">
            <Clock className="h-3.5 w-3.5 text-ember-500" />
            Patient portal
          </span>
        </div>
      </div>
    </header>
  )
}

export function Footer({ settings }: { settings?: { hotline?: string } }) {
  return (
    <footer className="border-t border-ink/10 bg-white px-4 py-4 text-[11px] text-ink-muted sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <p>Southwood Dialysis Center · Patient portal</p>
        {settings?.hotline && (
          <a
            href={`tel:${settings.hotline}`}
            className="flex items-center gap-1.5 hover:text-brand-700 transition-colors"
          >
            <Phone className="h-3 w-3" />
            {settings.hotline}
          </a>
        )}
      </div>
    </footer>
  )
}

export function Notice({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'info' | 'warning' }) {
  if (variant === 'info') {
    return (
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
        {children}
      </div>
    )
  }
  if (variant === 'warning') {
    return (
      <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
        {children}
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-ink/10 bg-sand-100/50 p-4 text-sm text-ink-soft">
      {children}
    </div>
  )
}

export function AppointmentsList({
  session,
  onRequestAppointment,
  onCancelAppointment,
}: {
  session: any
  onRequestAppointment: (formData: FormData) => void
  onCancelAppointment: (formData: FormData) => void
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">Appointments</h2>
        <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
          {session.cn}
        </span>
      </div>

      <form action={onRequestAppointment} className="mb-4">
        <RequestAppointmentFormFields />
      </form>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Upcoming</p>
        <p className="text-sm text-ink-muted">No appointments on file yet.</p>
      </div>
    </>
  )
}

export function RequestAppointmentFormFields() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-medium text-ink mb-1">Date and time</label>
        <input
          name="scheduled_at"
          type="datetime-local"
          defaultValue={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink mb-1">Notes</label>
        <input
          name="notes"
          placeholder="Any updates since last visit"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
    </div>
  )
}

export function FilesList({ session }: { session: any }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">Lab files</h2>
        <Link
          href="/portal/files"
          className="text-xs text-brand-700 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-ink/10 bg-sand-100/50 p-4 text-sm text-ink-muted">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-ember-500" />
          <span>No files available yet.</span>
        </div>
        <p className="mt-1 text-xs">
          When your clinician releases a result, it will appear here with a secure download link.
        </p>
      </div>
    </>
  )
}

export function FilesListWithFiles({ files }: { files: { id: string; title: string; category: string }[] }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">Lab files</h2>
        <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
          {files.length} file{files.length === 1 ? '' : 's'}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="mt-4 rounded-lg border border-ink/10 bg-sand-100/50 p-4 text-sm text-ink-muted">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-ember-500" />
            <span>No files available yet.</span>
          </div>
          <p className="mt-1 text-xs">
            When your clinician releases a result, it will appear here with a secure download link.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li key={file.id} className="rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ember-500" />
                  <span className="font-medium text-ink">{file.title}</span>
                </div>
                <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] text-ink-muted">
                  {file.category}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function BillingList() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">Billing</h2>
        <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-medium text-ink-soft">
          Summary
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-ink/10 bg-brand-50 p-4 text-sm">
        <span className="text-ink-soft">Current balance</span>
        <span className="font-medium text-brand-800">₱0.00</span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        Posted statements and payment history will appear here.
      </p>
    </>
  )
}

export function EmergencyPanel({ settings }: { settings?: { hotline?: string } }) {
  const hotline = settings?.hotline || ''
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">Urgent help</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-ember-50 px-2 py-0.5 text-[11px] font-medium text-ember-700">
          <AlertTriangle className="h-3 w-3" />
          On call
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-ember-200 bg-ember-50/60 p-4 text-sm">
        <p className="font-medium text-ember-800">
          For urgent symptoms between sessions, call the on-call line.
        </p>
        {hotline && (
          <a
            href={`tel:${hotline}`}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ember-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ember-800"
          >
            <Phone className="h-4 w-4" />
            {hotline}
          </a>
        )}
        <p className="mt-3 text-xs text-ember-700">
          For life-threatening emergencies, call emergency services immediately.
        </p>
      </div>
    </>
  )
}

export function TestimonialForm({
  session,
  onSubmit,
}: {
  session: any
  onSubmit: (formData: FormData) => void
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base text-ink">Share your experience</h2>
        <span className="text-[11px] text-ink-muted">Optional</span>
      </div>

      <form action={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink mb-1">Rating</label>
          <fieldset className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={String(n)}
                  defaultChecked={n === 5}
                  className="sr-only"
                />
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-white text-ember-500 hover:bg-ember-100">
                  {n}
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1">Your experience</label>
          <textarea
            name="body"
            required
            minLength={10}
            placeholder="What did Southwood do well? What could improve?"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 min-h-[100px] resize-none"
          />
        </div>

        <div className="flex justify-end">
          <SubmitTestimonialButton />
        </div>
      </form>
    </>
  )
}

function SubmitTestimonialButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      form="portal-testimonial"
      disabled={pending}
      className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Submit review'}
    </button>
  )
}
