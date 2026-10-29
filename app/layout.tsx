import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Southwood Dialysis Center',
  description: 'Southwood Dialysis Center - Comprehensive dialysis treatment and patient care',
  keywords: 'dialysis, kidney disease, treatment, medical, healthcare',
  viewport: 'width=device-width, initial-scale=1.0',
  generator: 'Southwood Dialysis Center Website',
}

export const notFound = () => null

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-neutral-900">
        {children}
      </body>
    </html>
  )
}