import type { ReactNode } from 'react'
import { Card, Empty, Field, Input, Notice, Select, Submit, Textarea } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { PageSchema, SectionSchema } from '@/lib/sheets/types'
import { savePageAction, saveSectionAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-xl text-ink mb-2">Content</h1>
      <p className="text-sm text-ink-muted mb-6">Manage pages and sections.</p>
      <Empty description="Content management is not wired yet." />
    </div>
  )
}
