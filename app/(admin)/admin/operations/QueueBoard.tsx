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

export function QueueBoard() {
  const [entries, setEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Today’s queue</h2>
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading queue…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Today’s queue</h2>
        <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-base text-ink mb-3">Today’s queue</h2>
      {entries.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-sm text-ink-muted text-center">
          No patients in queue right now.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{entry.patient_cn}</p>
                <p className="text-ink-muted text-xs">
                  Position {entry.position} · {entry.state}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  entry.state === 'Ongoing'
                    ? 'bg-brand-50 text-brand-700'
                    : entry.state === 'Waiting'
                    ? 'bg-ink/5 text-ink-soft'
                    : 'bg-ink/5 text-ink-muted'
                }`}
              >
                {entry.state}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
