import { UserSchema } from '@/lib/sheets/types'
type User = { cn?: string }
import { callSheets, isSheetsConfigured } from '@/lib/sheets/client'

export async function listUsers(_Schema: typeof UserSchema) {
  if (!isSheetsConfigured()) return []
  const users = await callSheets('users.list', {})
  return Array.isArray(users) ? users : []
}

export async function getUserByCn(cn: string) {
  if (!isSheetsConfigured()) return null
  const users = await listUsers(UserSchema)
  return (users as User[]).find((u) => u.cn === cn) ?? null
}
