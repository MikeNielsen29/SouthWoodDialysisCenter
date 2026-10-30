'use client'

import { useEffect, useState } from 'react'

interface Appointment {
  id: string
  patient_cn: string
  scheduled_at: string
  status: string
  notes: string
}

export function AppointmentsBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Appointments</h2>
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading appointments…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Appointments</h2>
        <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-base text-ink mb-3">Appointments</h2>
      {appointments.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-sm text-ink-muted text-center">
          No appointments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{apt.patient_cn}</p>
                <p className="text-ink-muted text-xs">{apt.scheduled_at}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  apt.status === 'Confirmed'
                    ? 'bg-brand-50 text-brand-700'
                    : apt.status === 'Cancelled' || apt.status === 'No-show'
                    ? 'bg-ink/5 text-ink-muted'
                    : 'bg-ink/5 text-ink-soft'
                }`}
              >
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
