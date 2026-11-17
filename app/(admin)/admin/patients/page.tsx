import type { Metadata } from 'next'
import Link from 'next/link'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { Notice } from '@/components/admin/ui'

export const metadata: Metadata = {
  title: 'Patients',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export interface PatientRow {
  cn: string
  full_name: string
  email: string
  phone: string
  is_active: string
  last_login_at: string
}

async function loadPatients(): Promise<{ patients: PatientRow[]; error?: string }> {
  if (!isSheetsConfigured()) {
    return { patients: [], error: 'The database is not connected yet.' }
  }

  try {
    const rows = await callSheets<unknown>('users.list', {})
    if (!Array.isArray(rows)) return { patients: [] }

    const patients = rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
      .filter((row) => String(row.role ?? '') === 'Patient')
      .map((row) => ({
        cn: String(row.cn ?? ''),
        full_name: String(row.full_name ?? ''),
        email: String(row.email ?? ''),
        phone: String(row.phone ?? ''),
        is_active: String(row.is_active ?? 'TRUE'),
        last_login_at: String(row.last_login_at ?? ''),
      }))
      .filter((patient) => patient.cn)
      .sort((a, b) => a.full_name.localeCompare(b.full_name))

    return { patients }
  } catch {
    return { patients: [], error: 'Could not read patient accounts from the database.' }
  }
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')
  const { patients, error } = await loadPatients()
  const query = (searchParams.q ?? '').trim().toLowerCase()
  const filtered = query
    ? patients.filter((patient) =>
        [patient.full_name, patient.cn, patient.email, patient.phone]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : patients

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-ink">Patients</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {patients.length} patient {patients.length === 1 ? 'account' : 'accounts'} · open a
            record to see appointments, lab files, and billing.
          </p>
        </div>
        <form className="flex gap-2" action="/admin/patients">
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Search name, CN, email"
            className="w-56 rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-900 px-3 py-1.5 text-sm font-medium text-sand-50"
          >
            Search
          </button>
        </form>
      </div>

      {error ? <Notice variant="warning">{error}</Notice> : null}

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand-50 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">CN</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last sign-in</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  {query ? 'No patients match that search.' : 'No patient accounts yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((patient) => (
                <tr key={patient.cn} className="hover:bg-sand-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/patients/${encodeURIComponent(patient.cn)}`}
                      className="font-medium text-brand-800 hover:underline"
                    >
                      {patient.full_name || 'Unnamed patient'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{patient.cn}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    <p>{patient.email || '—'}</p>
                    <p className="text-xs text-ink-muted">{patient.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        patient.is_active === 'TRUE'
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-ink/5 text-ink-muted'
                      }`}
                    >
                      {patient.is_active === 'TRUE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {patient.last_login_at || 'Never'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
