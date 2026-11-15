import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth/session'
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'
import { fileUploadProblem, type PatientFileRow } from '@/lib/patient-files'
import { Card, Empty, Field, Input, Notice, Pill, Submit, Table, TableData, TableHead, TableHeadCell, TableRow, TableRows } from '@/components/admin/ui'
import { uploadPatientFileAction } from './actions'

export const metadata: Metadata = {
  title: 'Lab files',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function loadFiles(): Promise<{ files: PatientFileRow[]; error?: string }> {
  if (!isSheetsConfigured()) return { files: [], error: 'The database is not connected yet.' }

  try {
    const rows = await callSheets<unknown>('files.list', {})
    if (!Array.isArray(rows)) return { files: [] }

    const files = rows
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
      .map((row) => ({
        id: String(row.id ?? ''),
        patient_cn: String(row.patient_cn ?? ''),
        title: String(row.title ?? ''),
        category: String(row.category ?? ''),
        vault_file_id: String(row.vault_file_id ?? ''),
        mime: String(row.mime ?? ''),
        size_bytes: String(row.size_bytes ?? '0'),
        iv: String(row.iv ?? ''),
        auth_tag: String(row.auth_tag ?? ''),
        uploaded_by: String(row.uploaded_by ?? ''),
        uploaded_at: String(row.uploaded_at ?? ''),
        status: String(row.status ?? ''),
      }))
      .filter((row) => row.id)

    return { files }
  } catch {
    return { files: [], error: 'Could not read the Files table. Check the CloudBase service.' }
  }
}

function sizeLabel(bytes: string): string {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '—'
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export default async function FilesPage({
  searchParams,
}: {
  searchParams: { uploaded?: string; released?: string; error?: string }
}) {
  await requireRoleOrRedirect(['Super Admin', 'Admin'], '/admin')

  const { files, error } = await loadFiles()
  const misconfigured = fileUploadProblem()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-xl text-ink">Lab files</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Upload a patient result: it is encrypted, stored in the Secure Vault, and published to
          that patient&apos;s portal. Only the patient can download it.
        </p>
      </div>

      {searchParams.error ? (
        <div className="mb-5">
          <Notice variant="warning">{searchParams.error}</Notice>
        </div>
      ) : null}
      {searchParams.uploaded ? (
        <div className="mb-5">
          <Notice variant="info">File uploaded and released to the patient portal.</Notice>
        </div>
      ) : null}
      {searchParams.released ? (
        <div className="mb-5">
          <Notice variant="info">File released.</Notice>
        </div>
      ) : null}
      {error ? (
        <div className="mb-5">
          <Notice variant="warning">{error}</Notice>
        </div>
      ) : null}
      {misconfigured ? (
        <div className="mb-5">
          <Notice variant="warning">{misconfigured}</Notice>
        </div>
      ) : null}

      <div className="mb-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="mb-4 font-display text-base text-ink">Upload a file</h2>
        <form action={uploadPatientFileAction} className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient control number">
            <Input name="patient_cn" required placeholder="SDC-2026-0001" />
          </Field>
          <Field label="Title (optional)">
            <Input name="title" placeholder="CBC results — November" />
          </Field>
          <Field label="File (PDF or image, max 10 MB)">
            <input
              type="file"
              name="file"
              required
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="block w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
            />
          </Field>
          <div className="flex items-end">
            <Submit type="submit">Upload and release</Submit>
          </div>
        </form>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-base text-ink">Uploaded files</h2>
        {files.length === 0 ? (
          <Empty description="No files uploaded yet." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Patient</TableHeadCell>
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Size</TableHeadCell>
                <TableHeadCell>Uploaded</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableRows>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableData>{file.patient_cn}</TableData>
                  <TableData>{file.title}</TableData>
                  <TableData>{sizeLabel(file.size_bytes)}</TableData>
                  <TableData>{file.uploaded_at ? file.uploaded_at.slice(0, 10) : '—'}</TableData>
                  <TableData>
                    <Pill variant={file.status === 'Released' ? 'brand' : 'default'}>{file.status}</Pill>
                  </TableData>
                  <TableData>
                    <div className="flex items-center gap-3">
                      <a
                        href={`/api/admin/files/${file.id}`}
                        className="text-xs font-medium text-brand-700 underline"
                      >
                        Download
                      </a>
                    </div>
                  </TableData>
                </TableRow>
              ))}
            </TableRows>
          </Table>
        )}
      </Card>
    </div>
  )
}
