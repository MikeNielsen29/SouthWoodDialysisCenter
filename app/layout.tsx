import './globals.css'
import { Metadata, Viewport } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Southwood Dialysis Center',
  description: 'Southwood Dialysis Center - Comprehensive dialysis treatment and patient care',
  keywords: 'dialysis, kidney disease, treatment, medical, healthcare',
  generator: 'Southwood Dialysis Center Website',
  icons: {
    icon: '/favicon.svg',
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
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}