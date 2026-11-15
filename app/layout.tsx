import './globals.css'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Southwood Dialysis Center',
  description: 'Southwood Dialysis Center - Comprehensive dialysis treatment and patient care',
  keywords: 'dialysis, kidney disease, treatment, medical, healthcare',
  generator: 'Southwood Dialysis Center Website',
  icons: {
    icon: '/favicon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B2C26',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Public chrome lives in app/(site)/layout.tsx so /admin and /portal
          render their own shells instead of the website header and footer. */}
      <body className="antialiased">{children}</body>
    </html>
  )
}