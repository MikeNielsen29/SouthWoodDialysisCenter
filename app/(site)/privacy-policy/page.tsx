import type { Metadata } from 'next'
import { getSettings } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How Southwood Dialysis Center collects, uses, and protects your personal and medical information.',
  robots: { index: true, follow: true },
}

export const dynamic = 'force-dynamic'

export default async function PrivacyPolicyPage() {
  const settings = await getSettings()

  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <h1 className="display text-[30px] leading-tight">Privacy policy</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Southwood Dialysis Center · Effective {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-ink-soft leading-relaxed space-y-5">
            <p>
              This privacy policy explains how Southwood Dialysis Center (“Southwood”, “we”, “us”) collects, uses, stores, and protects information about you when you use this website and the patient portal.
            </p>

            <h2>1. Information we collect</h2>
            <p>We may collect and process the following:</p>
            <ul>
              <li>Information you give us directly, such as your name, contact number, email address, and messages when you contact us or book an appointment.</li>
              <li>Health-related information necessary for your dialysis treatment, for example appointment history, results your clinician releases, and notes relevant to your care.</li>
              <li>Records of how you use the site and portal, so we can keep services working and respond to requests properly.</li>
            </ul>

            <h2>2. How we use it</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, schedule, and manage your dialysis care.</li>
              <li>Send appointment reminders and care-related updates.</li>
              <li>Store and release laboratory results and documents you request.</li>
              <li>Answer inquiries and communicate with you about your care.</li>
              <li>Meet reporting, recordkeeping, and regulatory requirements.</li>
            </ul>

            <h2>3. Legal basis</h2>
            <p>We process personal and health information based on your consent where required, our legitimate interest in providing safe care, and our legal obligations under applicable laws including the Data Privacy Act of 2012 (Republic Act No. 10173) and the E-Commerce Act of 2000 (Republic Act No. 8792).</p>

            <h2>4. How we protect it</h2>
            <ul>
              <li>Access to your records is limited to staff who need it for your care and administration.</li>
              <li>In the patient portal, you can only see your own records.</li>
              <li>Where available, passwords are stored in hashed form.</li>
              <li>Lab files you download are served through a short-lived, account-scoped link.</li>
              <li>We keep audit records of certain administrative actions so that access can be reviewed when needed.</li>
            </ul>

            <h2>5. Sharing with others</h2>
            <p>We do not sell or rent your personal information. We may share information only with your consent, with staff and service providers who need it for your care or for operating the clinic, or when required by law. Any external service we use is expected to handle data under agreements that limit its use to the purpose for which it was shared.</p>

            <h2>6. Cookies and similar technologies</h2>
            <p>We use essential cookies and session mechanisms to keep the site and portal working, including authentication and secure file downloads. We do not use tracking cookies for advertising on this site.</p>

            <h2>7. Your rights</h2>
            <p>Under the Data Privacy Act, you have the right to:</p>
            <ul>
              <li>Know whether we are processing data about you and request a copy.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request suspension, withdrawal of consent, or destruction where we lack a lawful basis.</li>
              <li>Ask us to notify third parties of a correction or erasure where appropriate.</li>
              <li>File a complaint with the National Privacy Commission if you believe your data has been mishandled.</li>
            </ul>
            <p>To exercise any right, contact our Data Protection Officer using the details in the site footer.</p>

            <h2>8. Children</h2>
            <p>Our services are intended for adult patients and their families. We do not knowingly collect personal information from children without parental consent.</p>

            <h2>9. Changes to this policy</h2>
            <p>We may update this policy from time to time. When we do, we will revise the date above and, where appropriate, notify users or ask for consent again. The policy shown here is the current version.</p>

            <h2>10. Contact</h2>
            <p>Questions about this policy or your data may be sent to the clinic using the contact details on the website, and ask for the Data Protection Officer.</p>
          </div>

          <div className="mt-10 border-t border-ink/10 pt-6 text-xs text-ink-muted">
            <p>Southwood Dialysis Center</p>
          </div>
      </div>
    </main>
  )
}
