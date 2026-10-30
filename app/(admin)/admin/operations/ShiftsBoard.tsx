'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
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

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Staff shifts</h2>
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading shifts…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Staff shifts</h2>
        <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-base text-ink mb-3">Staff shifts</h2>
      {shifts.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-sm text-ink-muted text-center">
          No shifts scheduled right now.
        </div>
      ) : (
        <div className="space-y-2">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{shift.staff_cn}</p>
                <p className="text-ink-muted text-xs">
                  {shift.station || 'General'}
                </p>
              </div>
              <p className="text-ink-muted text-xs">
                {shift.starts_at} – {shift.ends_at}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
