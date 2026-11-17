'use client'

import { useCallback, useEffect, useState } from 'react'

interface Shift {
  id: string
  staff_cn: string
  starts_at: string
  ends_at: string
  station: string
}

export function ShiftsBoard() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ staff_cn: '', starts_at: '', ends_at: '', station: '' })

  const load = useCallback(() => {
    fetch('/api/admin/shifts')
      .then((res) => res.json())
      .then((data) => {
        if (data?.shifts && Array.isArray(data.shifts)) {
          setShifts(data.shifts as Shift[])
        } else {
          setError('Could not load shifts.')
        }
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createShift = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error()
      setForm({ staff_cn: '', starts_at: '', ends_at: '', station: '' })
      setLoading(true)
      load()
    } catch {
      setError('Could not create the shift. Check the staff CN and time range.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base text-ink">Staff shifts</h2>
        <span className="text-xs text-ink-muted">{shifts.length} scheduled</span>
      </div>

      <form onSubmit={createShift} className="mb-4 space-y-2 rounded-lg bg-sand-50 p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-ink-soft">
            Staff CN
            <input
              required
              value={form.staff_cn}
              onChange={(event) => setForm({ ...form, staff_cn: event.target.value })}
              placeholder="SDC-…"
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink-soft">
            Station
            <input
              value={form.station}
              onChange={(event) => setForm({ ...form, station: event.target.value })}
              placeholder="General"
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink-soft">
            Starts
            <input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(event) => setForm({ ...form, starts_at: event.target.value })}
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-ink-soft">
            Ends
            <input
              required
              type="datetime-local"
              value={form.ends_at}
              onChange={(event) => setForm({ ...form, ends_at: event.target.value })}
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-900 px-3 py-1.5 text-xs font-medium text-sand-50 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add shift'}
        </button>
      </form>

      {error ? (
        <div className="mb-3 rounded-lg border border-ember-200 bg-ember-50 p-3 text-xs text-ember-800">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading shifts…
        </div>
      ) : shifts.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-center text-sm text-ink-muted">
          No shifts scheduled right now.
        </div>
      ) : (
        <div className="space-y-2">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{shift.staff_cn}</p>
                <p className="text-xs text-ink-muted">{shift.station || 'General'}</p>
              </div>
              <p className="shrink-0 text-right text-xs text-ink-muted">
                {shift.starts_at} – {shift.ends_at}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
