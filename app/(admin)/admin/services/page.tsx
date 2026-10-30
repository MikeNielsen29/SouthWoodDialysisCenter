import { Card, Empty, Field, Input, Labeled, Notice, Select, Submit, Textarea } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { ServiceSchema } from '@/lib/sheets/types'
import { saveServiceAction, deleteServiceAction } from '../actions'

export default async function ServicesPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const raw = await load('content.listServices', ServiceSchema.array())
  const data = Array.isArray(raw) ? raw : []
  const error = typeof raw === 'object' && raw !== null && 'error' in raw ? String((raw as { error?: string }).error) : ''

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-[28px] leading-tight">Services</h1>
        <p className="mt-1 text-sm text-ink-muted">Dialysis and kidney-care services shown on the public site.</p>
      </header>

      {searchParams.ok ? <Notice variant="info">{searchParams.ok}</Notice> : null}
      {searchParams.error ? <Notice variant="warning">{searchParams.error}</Notice> : null}
      {error ? <Notice variant="warning">{error}</Notice> : null}

      <Card>
        <h2 className="font-display text-base text-ink mb-1">Services</h2>
        {data.length > 0 ? (
          <div className="mt-4 space-y-4">
            {data.map((service) => (
              <form key={service.id} action={saveServiceAction} className="space-y-3 rounded-xl border border-ink/10 p-4">
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="slug" value={service.slug} />
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                  <Field><Labeled>Title</Labeled><Input name="title" defaultValue={service.title} required /></Field>
                  <Field><Labeled>Slug</Labeled><Input name="slug" defaultValue={service.slug} /></Field>
                  <Field><Labeled>Status</Labeled><Select name="status" defaultValue={service.status}><option value="published">Published</option><option value="draft">Draft</option></Select></Field>
                </div>
                <Field><Labeled>Summary</Labeled><Textarea name="summary" defaultValue={service.summary} className="min-h-[70px]" /></Field>
                <Field><Labeled>Icon name</Labeled><Input name="icon" defaultValue={service.icon} placeholder="kidney" /></Field>
                <div className="flex justify-end gap-2">
                  <Submit>Save</Submit>
                  <button type="submit" name="delete" formAction={deleteServiceAction} className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink-soft transition hover:border-ember-300 hover:text-ember-700">
                    Delete
                  </button>
                </div>
              </form>
            ))}
          </div>
        ) : (
          <Empty description="No services yet." />
        )}
      </Card>

      <Card>
        <h2 className="font-display text-base text-ink mb-1">New service</h2>
        <form action={saveServiceAction} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <Field><Labeled>Title</Labeled><Input name="title" required placeholder="Hemodialysis" /></Field>
            <Field><Labeled>Slug</Labeled><Input name="slug" required placeholder="hemodialysis" /></Field>
            <Field><Labeled>Status</Labeled><Select name="status" defaultValue="published"><option value="published">Published</option><option value="draft">Draft</option></Select></Field>
          </div>
          <Field><Labeled>Summary</Labeled><Textarea name="summary" className="min-h-[70px]" /></Field>
          <Field><Labeled>Icon name</Labeled><Input name="icon" placeholder="kidney" /></Field>
          <Submit>Create service</Submit>
        </form>
      </Card>
    </div>
  )
}
