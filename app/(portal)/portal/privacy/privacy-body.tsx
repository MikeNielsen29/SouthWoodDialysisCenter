export function PrivacyBody() {
  return (
    <div className="prose prose-sm max-w-none text-ink-soft leading-relaxed space-y-4">
      <p>We handle personal and medical information about our patients in line with the Data Privacy Act of 2012 (Republic Act No. 10173) and the E-Commerce Act of 2000 (Republic Act No. 8792).</p>
      <p>The things we keep, why we keep them, and who can see them are listed below so that you can make an informed choice about using this portal.</p>

      <h2>What we collect</h2>
      <ul>
        <li>Your control number, full name, email address and contact details, provided when your account was created.</li>
        <li>Health-related information necessary for your dialysis treatment, for example the terms of your treatment, results your clinician marks for you, and appointment history.</li>
        <li>Records of how you contact us, so that requests can be traced and answered properly.</li>
      </ul>

      <h2>Why we process it</h2>
      <p>We process information to: provide and manage your dialysis care; schedule sessions and send reminders; store laboratory results you request; respond to inquiries; and meet reporting and regulatory requirements.</p>

      <h2>How we keep it safe</h2>
      <ul>
        <li>Access to your records is limited to staff who need it for your care and administration, and is logged in our audit trail.</li>
        <li>You can only see your own records in the portal; staff see records you are authorised to see.</li>
        <li>Where available, passwords are stored as hashed values and transcripts are kept only as long as necessary.</li>
        <li>Lab files you receive are served through a short-lived download link from our server, with the same access limits as your account.</li>
      </ul>

      <h2>Your rights</h2>
      <p>Under the Data Privacy Act, you have the right to ask what we hold about you, to request correction, to ask us to suspend or delete processing where we lack a lawful basis, and to file a complaint with the National Privacy Commission if you believe your data has been mishandled. To exercise any right, contact our Data Protection Officer at the address or email listed in our settings.</p>

      <h2>Consent</h2>
      <p>By signing in to the portal you acknowledge that we may process your information as described here. If anything changes in how we handle data, we will update this notice and, where required, ask for your consent again.</p>

      <h2>Who to contact</h2>
      <p>Write to us at the clinic address shown in the website footer, or email the address listed there, and ask for the Data Protection Officer.</p>

      <p className="text-xs text-ink-muted pt-4 border-t border-ink/10">
        Last revised: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}.
        This notice may be changed from time to time; the one shown here is the current version.
      </p>
    </div>
  )
}
