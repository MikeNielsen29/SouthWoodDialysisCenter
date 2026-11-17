'use client'

import { useEffect, useState } from 'react'

interface Appointment {
  id: string
  patient_cn: string
  scheduled_at: string
  status: string
  chair: string
  notes: string
}

const STATUSES = ['Requested', 'Confirmed', 'Completed', 'Cancelled', 'No-show']

export function AppointmentsBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/appointments')
      .then((res) => res.json())
      .then((data) => {
        if (data?.appointments && Array.isArray(data.appointments)) {
          setAppointments(data.appointments as Appointment[])
        } else {
          setError('Could not load appointments.')
        }
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [])

  const updateAppointment = async (id: string, patch: { status?: string; chair?: string }) => {
    setSavingId(id)
    setError(null)
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      if (!response.ok) throw new Error()
      setAppointments((rows) =>
        rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
      )
    } catch {
      setError('Could not update the appointment.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base text-ink">Appointments</h2>
        <span className="text-xs text-ink-muted">{appointments.length} total</span>
      </div>
      {error ? (
        <div className="mb-3 rounded-lg border border-ember-200 bg-ember-50 p-3 text-xs text-ember-800">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading appointments…
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-center text-sm text-ink-muted">
          No appointments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <div key={apt.id} className="rounded-lg border border-ink/10 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{apt.patient_cn}</p>
                  <p className="text-xs text-ink-muted">{apt.scheduled_at}</p>
                </div>
                <select
                  value={apt.status}
                  disabled={savingId === apt.id}
                  onChange={(event) => updateAppointment(apt.id, { status: event.target.value })}
                  className="rounded-md border border-ink/15 bg-white px-2 py-1 text-xs text-ink disabled:opacity-50"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Chair
                </label>
                <input
                  defaultValue={apt.chair}
                  disabled={savingId === apt.id}
                  onBlur={(event) => {
                    const chair = event.target.value.trim()
                    if (chair !== (apt.chair || '')) updateAppointment(apt.id, { chair })
                  }}
                  placeholder="—"
                  className="w-20 rounded-md border border-ink/15 px-2 py-1 text-xs text-ink disabled:opacity-50"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
