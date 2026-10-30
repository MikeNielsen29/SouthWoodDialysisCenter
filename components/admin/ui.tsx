import * as React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-ink/10 bg-white p-6 shadow-soft ${className}`}>
      {children}
    </div>
  )
}

export interface EmptyProps {
  description?: string
  className?: string
}

export function Empty({ description, className = '' }: EmptyProps) {
  return (
    <div className={`rounded-xl border border-ink/10 bg-white p-12 text-center text-sm text-ink-muted ${className}`}>
      {description}
    </div>
  )
}

export interface NoticeProps {
  variant?: 'info' | 'warning' | 'error' | 'success'
  children?: React.ReactNode
  className?: string
}

export function Notice({ variant = 'info', children, className = '' }: NoticeProps) {
  const base = 'rounded-xl border px-4 py-3 text-sm'
  const styles: Record<string, string> = {
    info: 'border-brand-200 bg-brand-50 text-brand-800',
    warning: 'border-ember-200 bg-ember-50 text-ember-800',
    error: 'border-ember-200 bg-ember-50 text-ember-800',
    success: 'border-brand-200 bg-brand-50 text-brand-800',
  }
  return (
    <div className={`${base} ${styles[variant]} ${className}`}>{children}</div>
  )
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  children?: React.ReactNode
  className?: string
}

export function Field({ label, children, className = '' }: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</span>}
      {children}
    </div>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function Input({ className = '', ...props }: InputProps) {
  const base =
    'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:outline-none'
  return <input className={`${base} ${className}`} {...props} />
}

export interface LabeledProps {
  children?: React.ReactNode
  className?: string
}

export function Labeled({ children, className = '' }: LabeledProps) {
  return <span className={`block text-[11px] font-medium text-ink-soft ${className}`}>{children}</span>
}

export interface SubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
}

export function Submit({ className = '', children, ...props }: SubmitProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-medium text-sand-50 transition-colors hover:bg-brand-900'
  return <button className={`${base} ${className}`} {...props}>{children}</button>
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  const base =
    'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:outline-none'
  return <textarea className={`${base} ${className}`} {...props} />
}

export interface FileTextProps extends React.SVGProps<SVGSVGElement> {}

export function FileText({ className = '', ...props }: FileTextProps) {
  return <svg className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
}

export interface PillProps {
  variant?: 'primary' | 'outline' | 'ghost'
  children?: React.ReactNode
  className?: string
}

export function Pill({ variant = 'primary', children, className = '' }: PillProps) {
  const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'
  const styles: Record<string, string> = {
    primary: 'bg-brand-100 text-brand-800',
    outline: 'border border-ink/15 text-ink-soft',
    ghost: 'text-ink-soft',
  }
  return <span className={`${base} ${styles[variant]} ${className}`}>{children}</span>
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
}

export function Select({ className = '', ...props }: SelectProps) {
  const base =
    'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink transition-colors focus:border-brand-600 focus:outline-none'
  return <select className={`${base} ${className}`} {...props} />
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return <table className={`w-full text-sm ${className}`}>{children}</table>
}

export interface TableHeadProps {
  children?: React.ReactNode
  className?: string
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return <thead className={`${className}`}>{children}</thead>
}

export interface TableRowsProps {
  children?: React.ReactNode
  className?: string
}

export function TableRows({ children, className = '' }: TableRowsProps) {
  return <tbody className={`${className}`}>{children}</tbody>
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={`${className}`}>{children}</tr>
}

export interface TableHeadCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode
  className?: string
}

export function TableHeadCell({ children, className = '' }: TableHeadCellProps) {
  return <th className={`text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted pb-3 ${className}`}>{children}</th>
}

export interface TableDataProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode
  className?: string
}

export function TableData({ children, className = '' }: TableDataProps) {
  return <td className={`py-3 text-sm text-ink ${className}`}>{children}</td>
}

export interface StatProps {
  label: string
  value: string | number
  className?: string
}

export function Stat({ label, value, className = '' }: StatProps) {
  return (
    <div className={`rounded-xl border border-ink/10 bg-white p-4 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-lg text-ink">{value}</p>
    </div>
  )
}
