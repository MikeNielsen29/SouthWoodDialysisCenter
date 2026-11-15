import type { ReactNode } from 'react'

export function Notice({ kind, children }: { kind?: 'info' | 'success' | 'error'; children?: ReactNode }) {
  if (!children && kind === 'info') return null
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${
        kind === 'error'
          ? 'border border-ember-400/40 bg-ember-100/50 text-ember-700'
          : kind === 'success'
          ? 'border border-brand-200 bg-brand-50 text-brand-800'
          : 'border border-ink/10 bg-sand-100/60 text-ink-soft'
      }`}
    >
      {children ?? (kind === 'info' ? 'Done.' : 'An unexpected problem happened.')}
    </p>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: { label: string; htmlFor?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-ink-muted">{hint}</p> : null}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[14px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${props.className ?? ''}`}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[14px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 min-h-[70px] ${props.className ?? ''}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[14px] text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${props.className ?? ''}`}
    />
  )
}

export function Pill({ tone, children }: { tone: 'neutral' | 'good' | 'warn' | 'bad'; children: ReactNode }) {
  const tones: Record<string, string> = {
    neutral: 'bg-sand-100 text-ink-soft',
    good: 'bg-brand-50 text-brand-700',
    warn: 'bg-ember-100 text-ember-700',
    bad: 'bg-ember-100 text-ember-700',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone] ?? tones.neutral}`}>
      {children}
    </span>
  )
}

export function Submit({ tone = 'primary', children, ...rest }: { tone?: 'primary' | 'ghost' | 'danger'; children?: ReactNode; [x: string]: unknown }) {
  const tones = {
    primary: 'bg-brand-900 text-sand-50 hover:bg-brand-800',
    ghost: 'border border-ink/15 bg-white text-ink hover:border-brand-300 hover:text-ember-700',
    danger: 'border border-ember-400/50 bg-white text-ember-700 hover:bg-ember-100/60',
  }
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${tones[tone] ?? tones.primary} ${rest.className ?? ''}`}
    >
      {children ?? 'Submit'}
    </button>
  )
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {head.map((label) => (
              <th key={label} className="whitespace-nowrap py-2 pr-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">{children}</tbody>
      </table>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center text-sm text-ink-muted">
      {children}
    </p>
  )
}

export function toLocal(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-PH')
}

export function sizeText(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
