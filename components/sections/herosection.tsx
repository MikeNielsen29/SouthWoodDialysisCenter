import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Section() {
  return (
    <section className="py-24 sm:py-32 lg:py-48 bg-[linear-gradient(135deg,var(--kidney-gradient))] text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Comprehensive<br />
              Dialysis Care
            </h1>
            <p className="text-neutral-200 text-lg mb-8 max-w-xl">
              We provide compassionate, state-of-the-art dialysis treatment in a
              caring environment. Our expert medical team is dedicated to improving
              your quality of life.
            </p>
            <div className="flex gap-3">
              <Button variant="gradient" className="px-6 py-3">
                Book Appointment
              </Button>
              <Button variant="outline" className="px-6 py-3">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/hero-banner.jpg"
              alt="Dialysis treatment center with modern equipment"
              width={600}
              height={500}
              className="rounded-2xl object-cover shadow-2xl"
              loading="lazy"
            />
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 bg-orange-500/10 rounded-full h-40 w-40 opacity-70 animate-fade-in-slow" />
          </div>
        </div>
      </div>
    </section>
  )
}