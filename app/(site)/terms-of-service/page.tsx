import type { Metadata } from 'next'
import { getSettings } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Terms of service',
  description:
    'Terms of use for the Southwood Dialysis Center website and patient portal.',
  robots: { index: true, follow: true },
}

export const dynamic = 'force-dynamic'

export default async function TermsOfServicePage() {
  const settings = await getSettings()

  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <h1 className="display text-[30px] leading-tight">Terms of service</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Southwood Dialysis Center · Effective {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-ink-soft leading-relaxed space-y-5">
            <p>
              By accessing or using the Southwood Dialysis Center website and patient portal (together, “the services”), you agree to these terms. If you do not agree, do not use the services.
            </p>

            <h2>1. Services we provide</h2>
            <p>
              Southwood Dialysis Center provides information about our clinic and services, a way to contact us and request appointments, and a private patient portal for authenticated patients to view certain care-related information and documents.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              The patient portal is intended for patients of Southwood Dialysis Center and their authorized representatives. You are responsible for keeping your account credentials and device secure. If you believe an account has been compromised, contact us immediately.
            </p>

            <h2>3. Accurate information</h2>
            <p>
              You agree to provide current and accurate contact details, appointment information, and other records you submit. We are not responsible for delays or errors caused by incorrect information you provide.
            </p>

            <h2>4. Medical information disclaimer</h2>
            <p>
              Information in the portal is provided for care coordination and convenience. It is not a substitute for direct medical advice. If you have an urgent or life-threatening concern, contact your clinician, call the on-call line, or seek emergency services immediately.
            </p>

            <h2>5. File access</h2>
            <p>
              Lab results and documents are released by your clinician and accessed through a short-lived, account-scoped download link. Do not share download links with others. Files are stored encrypted and access is logged for security.
            </p>

            <h2>6. Conduct</h2>
            <p>
              You agree not to misuse the services, including by attempting to access another person’s records, interfering with the site or portal, or using the services in a way that violates law or these terms.
            </p>

            <h2>7. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. When we do, we will revise the effective date above. Continued use of the services after a change counts as acceptance of the revised terms. The terms shown here are the current version.
            </p>

            <h2>8. Limitation of liability</h2>
            <p>
              The services are provided on an as-is basis to the extent permitted by law. To the fullest extent permitted, Southwood Dialysis Center is not liable for indirect, incidental, or consequential losses arising from your use of the services, except where liability cannot be excluded under applicable law.
            </p>

            <h2>9. Governing law</h2>
            <p>
              These terms are governed by the laws of the Philippines. Any dispute arising from them shall be resolved in accordance with those laws.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions about these terms may be sent to the clinic using the contact details on the website.
            </p>
          </div>

          <div className="mt-10 border-t border-ink/10 pt-6 text-xs text-ink-muted">
            <p>Southwood Dialysis Center</p>
          </div>
      </div>
    </main>
  )
}
