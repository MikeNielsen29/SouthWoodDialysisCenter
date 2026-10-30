// Portal data helpers — kept thin until the portal actions and shared UI are wired.
export async function getPortalSettings() {
  const { getSettings } = await import('@/lib/content')
  return getSettings()
}
