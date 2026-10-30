'use client'

import { useEffect, useState } from 'react'

interface BillingRecord {
  id: string
  patient_cn: string
  invoice_no: string
  amount_php: string
  status: string
  issued_at: string
}

export function BillingBoard() {
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/billing')
      .then((res) => res.json())
      .then((data) => {
        if (data?.records && Array.isArray(data.records)) {
          setRecords(data.records as BillingRecord[])
        } else {
          setError('Could not load billing records.')
        }
      })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Billing</h2>
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading billing…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="font-display text-base text-ink mb-3">Billing</h2>
        <div className="rounded-lg border border-ember-200 bg-ember-50 p-4 text-sm text-ember-800">
          {error}
        </div>
      </div>
    )
  }

  const total = records.reduce((sum, r) => sum + (parseInt(r.amount_php || '0', 10) || 0), 0)

  return (
    <div>
      <h2 className="font-display text-base text-ink mb-3">Billing</h2>
      {records.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-sm text-ink-muted text-center">
          No billing records yet.
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between rounded-lg border border-ink/10 bg-brand-50 p-3 text-sm">
            <span className="text-ink-soft">Total this month</span>
            <span className="font-medium text-brand-800">
              ₱{total.toLocaleString('en-PH')}
            </span>
          </div>
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-ink/10 bg-white p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{record.patient_cn}</p>
                  <p className="text-ink-muted text-xs">{record.invoice_no}</p>
                </div>
                <div>
                  <p className="font-medium text-ink">₱{parseInt(record.amount_php || '0', 10).toLocaleString('en-PH')}</p>
                  <p className="text-ink-muted text-xs">{record.issued_at}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
