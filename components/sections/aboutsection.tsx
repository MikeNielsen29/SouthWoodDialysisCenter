import Image from 'next/image'

export function AboutSection() {
  return (
    <section className="py-24 sm:py-32 lg:py-48 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-orange-600 mb-6">About Southwood Dialysis Center</h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-6">
              Southwood Dialysis Center has been serving the community since 2024,
              providing comprehensive kidney dialysis treatment with state-of-the-art
              equipment and a compassionate team of medical professionals.
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-3 mb-6">
              <li>
                Three modern dialysis stations with advanced water treatment systems
              </li>
              <li>
                Board-certified nephrologists and certified dialysis technicians
              </li>
              <li>
                Personalized treatment plans tailored to each patient's needs
              </li>
              <li>
                Flexible scheduling including morning, afternoon, and evening slots
              </li>
            </ul>
            <p className="text-neutral-600 text-lg">
              Our mission is to provide exceptional kidney care in a supportive,
              comfortable environment where patients feel valued and supported
              throughout their treatment journey.
            </p>
          </div>
          <div>
            <Image
              src="/about-image.jpg"
              alt="Modern dialysis center with medical staff and patients"
              width={500}
              height={400}
              className="rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="mt-16 pt-16 border-t border-neutral-200">
          <h3 className="text-2xl font-bold text-orange-600 mb-4">Our Commitment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border-r border-neutral-200">
              <h4 className="text-orange-600 font-medium mb-2">Quality</h4>
              <p className="text-neutral-600 text-sm">
                Highest standards of care and safety
              </p>
            </div>
            <div className="p-4 border-l border-neutral-200">
              <h4 className="text-orange-600 font-medium mb-2">Compassion</h4>
              <p className="text-neutral-600 text-sm">
                Patient-centered care with empathy
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}