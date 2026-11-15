import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { buttonClasses } from '@/components/ui/button-styles'
import { Reveal } from '@/components/ui/reveal'

export function CtaSection() {
  return (
    <section className="pb-20 pt-4 sm:pb-24 lg:pb-28">
      <div className="shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 px-7 py-12 text-center shadow-lift sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(208,124,60,0.22)_0%,transparent_65%)]"
            />

            <div className="relative mx-auto max-w-2xl">
              <span className="eyebrow justify-center text-ember-400">Get started</span>
              <h2 className="display mt-5 text-balance text-[32px] leading-[1.1] text-sand-50 sm:text-[42px]">
                Ready to talk about
                <span className="italic text-ember-400"> your treatment plan?</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-sand-100/70">
                Tell us a little about your situation and we will call you back within
                one working day. No referrals needed to start the conversation.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contact" className={buttonClasses('accent', 'lg', 'w-full sm:w-auto')}>
                  Book an appointment
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href="tel:+15550142800"
                  className={buttonClasses(
                    'ghost',
                    'lg',
                    'w-full border border-sand-50/20 text-sand-100 hover:text-white sm:w-auto',
                  )}
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  (555) 014-2800
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
