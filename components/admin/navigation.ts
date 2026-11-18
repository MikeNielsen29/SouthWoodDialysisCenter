import type { Role } from '@/lib/auth/jwt'

export interface AdminNavigationItem {
  href: string
  label: string
  roles: Role[]
}

export interface AdminNavigationGroup {
  title: string
  description: string
  items: AdminNavigationItem[]
}

export const ADMIN_NAVIGATION: AdminNavigationGroup[] = [
  {
    title: 'Dashboard',
    description: 'Start here and check the clinic at a glance.',
    items: [
      { href: '/admin', label: 'Overview', roles: ['Super Admin', 'Admin', 'Page Editor'] },
    ],
  },
  {
    title: 'Website',
    description: 'Public pages, services, news and media.',
    items: [
      { href: '/admin/content', label: 'Page content', roles: ['Super Admin', 'Admin', 'Page Editor'] },
      { href: '/admin/services', label: 'Services', roles: ['Super Admin', 'Admin', 'Page Editor'] },
      { href: '/admin/news', label: 'News', roles: ['Super Admin', 'Admin', 'Page Editor'] },
      { href: '/admin/media', label: 'Media', roles: ['Super Admin', 'Admin'] },
    ],
  },
  {
    title: 'Clinic',
    description: 'Patients, daily flow, lab files and billing.',
    items: [
      { href: '/admin/patients', label: 'Patients', roles: ['Super Admin', 'Admin'] },
      { href: '/admin/operations', label: 'Operations', roles: ['Super Admin', 'Admin'] },
      { href: '/admin/files', label: 'Lab files', roles: ['Super Admin', 'Admin'] },
    ],
  },
  {
    title: 'Messages',
    description: 'Inquiries and patient reviews.',
    items: [
      { href: '/admin/inquiries', label: 'Inquiries', roles: ['Super Admin', 'Admin'] },
      { href: '/admin/testimonials', label: 'Testimonials', roles: ['Super Admin', 'Admin'] },
    ],
  },
  {
    title: 'System',
    description: 'Accounts, settings and accountability.',
    items: [
      { href: '/admin/user-management', label: 'Users', roles: ['Super Admin'] },
      { href: '/admin/settings', label: 'Settings', roles: ['Super Admin', 'Admin'] },
      { href: '/admin/audit', label: 'Audit log', roles: ['Super Admin'] },
    ],
  },
]

export function navigationForRole(role: Role): AdminNavigationGroup[] {
  return ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)
}
