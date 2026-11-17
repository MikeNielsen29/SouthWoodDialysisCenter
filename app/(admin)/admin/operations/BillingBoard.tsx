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
  const [savingId, setSavingId] = useState<string | null>(null)

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

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id)
    setError(null)
    try {
      const response = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!response.ok) throw new Error()
      setRecords((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)))
    } catch {
      setError('Could not update the invoice.')
    } finally {
      setSavingId(null)
    }
  }

  const total = records
    .filter((record) => record.status !== 'Void')
    .reduce((sum, record) => sum + (parseInt(record.amount_php || '0', 10) || 0), 0)

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base text-ink">Billing</h2>
        <span className="text-xs text-ink-muted">₱{total.toLocaleString('en-PH')} issued</span>
      </div>
      {error ? (
        <div className="mb-3 rounded-lg border border-ember-200 bg-ember-50 p-3 text-xs text-ember-800">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-sm text-ink-muted">
          Loading billing…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-ink/10 bg-sand-100/60 p-5 text-center text-sm text-ink-muted">
          No billing records yet.
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-ink/10 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{record.patient_cn}</p>
                  <p className="text-xs text-ink-muted">{record.invoice_no}</p>
                </div>
                <p className="shrink-0 font-medium text-ink">
                  ₱{parseInt(record.amount_php || '0', 10).toLocaleString('en-PH')}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    record.status === 'Paid'
                      ? 'bg-brand-50 text-brand-700'
                      : record.status === 'Void'
                        ? 'bg-ink/5 text-ink-muted'
                        : 'bg-ember-50 text-ember-800'
                  }`}
                >
                  {record.status}
                </span>
                <div className="flex gap-1.5">
                  {record.status !== 'Paid' && record.status !== 'Void' ? (
                    <button
                      type="button"
                      disabled={savingId === record.id}
                      onClick={() => updateStatus(record.id, 'Paid')}
                      className="rounded-md bg-brand-900 px-2.5 py-1 text-xs font-medium text-sand-50 disabled:opacity-50"
                    >
                      Mark paid
                    </button>
                  ) : null}
                  {record.status === 'Paid' ? (
                    <button
                      type="button"
                      disabled={savingId === record.id}
                      onClick={() => updateStatus(record.id, 'Unpaid')}
                      className="rounded-md border border-ink/15 px-2.5 py-1 text-xs text-ink-soft disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
