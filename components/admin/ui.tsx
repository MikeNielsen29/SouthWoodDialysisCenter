'use client'

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { FileText as FileTextIcon } from 'lucide-react'

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-ink/10 bg-white p-5">{children}</div>
}

export function Empty({ description }: { description: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-8 text-center">
      <p className="text-sm text-ink-muted">{description}</p>
    </div>
  )
}

export function Field({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      {label && <label className="block text-xs font-medium text-ink">{label}</label>}
      {children}
    </div>
  )
}

export function Labeled({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={`block text-xs font-medium text-ink ${className ?? ''}`}>{children}</label>
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${className ?? ''}`}
      {...props}
    />
  )
}

export function Textarea({ className, rows, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none ${className ?? ''}`}
      rows={rows}
      {...props}
    />
  )
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${className ?? ''}`}
      {...props}
    />
  )
}

export function Notice({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'info' | 'warning' }) {
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

export function Submit({ children, className, type = 'button', ...props }: { children: ReactNode; className?: string; type?: 'button' | 'submit' | 'reset' } & Omit<InputHTMLAttributes<HTMLButtonElement>, 'type'>) {
  return (
    <button
      className={`rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-50 ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Pill({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'brand' | 'ember' }) {
  const base = 'inline-flex rounded-full px-2 py-0.5 text-xs font-medium'
  const variants = {
    default: 'bg-ink/5 text-ink-soft',
    brand: 'bg-brand-50 text-brand-700',
    ember: 'bg-ember-50 text-ember-700',
  }
  return <span className={`${base} ${variants[variant]}`}>{children}</span>
}

export function FileText({ className }: { className?: string }) {
  return <FileTextIcon className={className ?? 'h-4 w-4'} />
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-ink">{value}</p>
    </div>
  )
}

export function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function TableHead({ children }: { children: ReactNode }) {
  return <div className="bg-sand-50/80">{children}</div>
}

export function TableRows({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

export function TableRow({ children }: { children: ReactNode }) {
  return <div className="border-b border-ink/5 last:border-0">{children}</div>
}

export function TableHeadCell({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
      {children}
    </div>
  )
}

export function TableData({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 text-sm text-ink ${className ?? ''}`}>
      {children}
    </div>
  )
}

export type { ReactNode as AdminUIRegistryValue }
