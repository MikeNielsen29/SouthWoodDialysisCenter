/**
 * The six services the public site ships with.
 *
 * `components/sections/servicessection.tsx` renders these when the Services
 * sheet is empty. The admin page imports the same list so staff can copy them
 * into the database and start editing, instead of retyping every card.
 */

export interface DefaultService {
  slug: string
  title: string
  summary: string
  icon: string
  sort_order: string
}

export const DEFAULT_SERVICES: DefaultService[] = [
  {
    slug: 'hemodialysis',
    title: 'Hemodialysis',
    summary:
      'Advanced dialysis machines and purified water systems, run by certified technicians in a calm treatment bay.',
    icon: 'droplets',
    sort_order: '1',
  },
  {
    slug: 'peritoneal-dialysis',
    title: 'Peritoneal Dialysis',
    summary:
      'A flexible at-home programme with hands-on training, so treatment fits around your daily routine.',
    icon: 'heartHandshake',
    sort_order: '2',
  },
  {
    slug: 'preventive-care',
    title: 'Preventive Care',
    summary:
      'Kidney function screening and early intervention for patients managing diabetes and hypertension.',
    icon: 'shieldPlus',
    sort_order: '3',
  },
  {
    slug: 'renal-nutrition',
    title: 'Renal Nutrition',
    summary:
      'Personalised meal plans from registered dietitians specialising in renal nutrition and fluid balance.',
    icon: 'salad',
    sort_order: '4',
  },
  {
    slug: 'patient-education',
    title: 'Patient Education',
    summary:
      'Workshops for patients and families on dialysis, medication, and living well with kidney disease.',
    icon: 'graduationCap',
    sort_order: '5',
  },
  {
    slug: 'urgent-support',
    title: 'Urgent Support',
    summary:
      'Same-day assessment and an on-call clinical line for unexpected symptoms between sessions.',
    icon: 'ambulance',
    sort_order: '6',
  },
]
