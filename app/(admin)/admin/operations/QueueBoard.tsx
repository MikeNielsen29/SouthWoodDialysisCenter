'use client'

import { useEffect, useState } from 'react'

interface QueueEntry {
  id: string
  patient_cn: string
  state: string
  position: string
  started_at: string
  completed_at: string
  updated_at: string
}

const STATES = ['Waiting', 'Ongoing', 'Completed']

export function QueueBoard() {
  const [entries, setEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/queue')
      .then((res) => res.json())
      .then((data) => {
        if (data?.entries && Array.isArray(data.entries)) {
          setEntries(data.entries as QueueEntry[])
        } else {
          setError('Could not load queue.')
        }
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [])

  const updateState = async (id: string, state: string) => {
    if (state === entries.find((entry) => entry.id === id)?.state) return
    setSavingId(id)
    setError(null)
    try {
      const response = await fetch('/api/admin/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, state }),
      })
      if (!response.ok) throw new Error()
      setEntries((rows) => rows.map((row) => (row.id === id ? { ...row, state } : row)))
    } catch {
      setError('Could not update the queue entry.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base text-ink">Today’s queue</h2>
        <span className="text-xs text-ink-muted">{entries.length} in queue</span>
      </div>
      {error ? (
        <div className="mb-3 rounded-lg border border-ember-200 bg-ember-50 p-3 text-xs text-ember-800">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading queue…
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-center text-sm text-ink-muted">
          No patients in queue right now.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{entry.patient_cn}</p>
                <p className="text-xs text-ink-muted">Position {entry.position || '—'}</p>
              </div>
              <select
                value={entry.state}
                disabled={savingId === entry.id}
                onChange={(event) => updateState(entry.id, event.target.value)}
                className="rounded-md border border-ink/15 bg-white px-2 py-1 text-xs text-ink disabled:opacity-50"
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
