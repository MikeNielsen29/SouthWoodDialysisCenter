import { Card, Empty, Field, Input, Notice, Select, Submit, Textarea } from '@/components/admin/ui'
import { load } from '@/lib/admin/data'
import { NewsPostSchema } from '@/lib/sheets/types'
import { saveNewsAction } from '../actions'

export const dynamic = 'force-dynamic'

function localDate(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export default async function NewsAdminPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const raw = await load('content.listNews', NewsPostSchema.array())
  const data = Array.isArray(raw) ? raw : []
  const error = typeof raw === 'object' && raw !== null && 'error' in raw ? String((raw as { error?: string }).error) : ''

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-[28px] leading-tight">News and updates</h1>
        <p className="mt-1 text-sm text-ink-muted">The three newest published articles appear on the homepage.</p>
      </header>

      {searchParams.ok ? <Notice variant="info">{searchParams.ok}</Notice> : null}
      {searchParams.error ? <Notice variant="warning">{searchParams.error}</Notice> : null}
      {error ? <Notice variant="warning">{error}</Notice> : null}

      <Card>
        <h2 className="font-display text-base text-ink mb-1">Published articles</h2>
        {data.length > 0 ? (
          <div className="mt-4 space-y-4">
            {data.map((post) => (
              <form key={post.id} action={saveNewsAction} className="space-y-3 rounded-xl border border-ink/10 p-4">
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="slug" value={post.slug} />
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                  <Field label="Headline"><Input name="title" defaultValue={post.title} required /></Field>
                  <Field label="Date"><Input name="published_at" type="date" defaultValue={localDate(post.published_at)} /></Field>
                  <Field label="Status"><Select name="status" defaultValue={post.status}><option value="published">Published</option><option value="draft">Draft</option></Select></Field>
                </div>
                <Field label="Summary"><Textarea name="excerpt" defaultValue={post.excerpt} className="min-h-[70px]" /></Field>
                <Field label="Full text"><Textarea name="body" defaultValue={post.body} /></Field>
                <Submit>Save article</Submit>
              </form>
            ))}
          </div>
        ) : (
          <Empty description="No articles yet. The homepage is showing the built-in three." />
        )}
      </Card>

      <Card>
        <h2 className="font-display text-base text-ink mb-1">New article</h2>
        <form action={saveNewsAction} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="Headline"><Input name="title" required placeholder="New treatment bay opens" /></Field>
            <Field label="Date"><Input name="published_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
          </div>
          <Field label="Summary"><Textarea name="excerpt" className="min-h-[70px]" /></Field>
          <Field label="Full text"><Textarea name="body" /></Field>
          <Submit>Publish article</Submit>
        </form>
      </Card>
    </div>
  )
}
