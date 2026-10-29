import Image from 'next/image'

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 lg:py-48 bg-[linear-gradient(135deg,var(--kidney-gradient))] text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Patient Testimonials</h2>
          <p className="text-neutral-200 text-lg">
            Read stories from patients who have received care at our center.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Testimonial Card 1 */}
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-orange-200/20">
            <p className="text-neutral-200 quotes mb-6">
              <q>
                Since starting hemodialysis at Southwood, my energy levels have
                improved dramatically. The staff is incredibly caring and the
                facility is spotless.
              </q>
            </p>
            <div className="flex items-center gap-3">
              <Image
                src="/testimonial1.jpg"
                alt="Patient testimonial photo 1"
                width={40}
                height={40}
                className="rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="font-medium">Maria S.</p>
                <p className="text-neutral-300 text-sm">Patient since 2024</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 2 */}
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-teal-200/20">
            <p className="text-neutral-200 quotes mb-6">
              <q>
                The peritoneal dialysis program gave me my life back. I can now
                treatment at home and spend more time with my family. Thank you,
                Southwood Dialysis Center!
              </q>
            </p>
            <div className="flex items-center gap-3">
              <Image
                src="/testimonial2.jpg"
                alt="Patient testimonial photo 2"
                width={40}
                height={40}
                className="rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="font-medium">James W.</p>
                <p className="text-neutral-300 text-sm">Patient since 2023</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card 3 */}
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border-green-200/20">
            <p className="text-neutral-200 quotes mb-6">
              <q>
                The team at Southwood truly cares about their patients. From the
                moment I walked in, I felt welcomed and supported throughout my
                treatment journey.
              </q>
            </p>
            <div className="flex items-center gap-3">
              <Image
                src="/testimonial3.jpg"
                alt="Patient testimonial photo 3"
                width={40}
                height={40}
                className="rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="fontSenior">Robert K.</p>
                <p className="text-neutral-300 text-sm">Patient since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}