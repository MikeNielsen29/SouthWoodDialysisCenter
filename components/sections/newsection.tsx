import Image from 'next/image'

export function NewsSection() {
  return (
    <section className="py-24 sm:py-32 lg:py-48 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-orange-600 mb-4">News & Updates</h2>
          <p className="text-neutral-600 text-lg">
            Stay informed with the latest news, health tips, and center updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* News Card 1 */}
          <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-neutral-200">
            <Image
              src="/news1.jpg"
              alt="New water treatment system installed at Southwood Dialysis Center"
              width={400}
              height={250}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <span className="text-orange-500 text-sm font-medium mb-2">January 15, 2024</span>
              <h3 className="text-xl font-medium hover:text-orange-600 transition-colors">
                State-of-the-New Water Treatment System Installed
              </h3>
              <p className="text-neutral-600 text-sm line-clamp-2">
                Southwood Dialysis Center has recently installed a state-of-the-art
                water treatment system to ensure the highest quality standards for
                all dialysis treatments.
              </p>
            </div>
          </div>

          {/* News Card 2 */}
          <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-neutral-200">
            <Image
              src="/news2.jpg"
              alt="Patient wellness workshop at Southwood Dialysis Center"
              width={400}
              height={250}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <span className="text-teal-500 text-sm font-medium mb-2">January 8, 2024</span>
              <h3 className="text-xl font-medium hover:text-teal-600 transition-colors">
                Patient Wellness Workshop: Nutrition & Kidney Health
              </h3>
              <p className="text-neutral-600 text-sm line-clamp-2">
                Join our upcoming wellness workshop focused on nutrition guidelines
                for kidney patients and maintaining a healthy lifestyle during
                dialysis treatment.
              </p>
            </div>
          </div>

          {/* News Card 3 */}
          <div className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-neutral-200">
            <Image
              src="/news3.jpg"
              alt="Southwood Dialysis Center staff training session"
              width={400}
              height={250}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="p-4">
              <span className="text-neutral-500 text-sm font-medium mb-2">December 20, 2023</span>
              <h3 className="text-xl font-medium hover:text-orange-600 transition-colors">
                Continuous Staff Training & Certification Update
              </h3>
              <p className="text-neutral-600 text-sm line-clamp-2">
                Our medical team undergoes regular continuous training and
                certification updates to stay current with the latest dialysis
                protocols and best practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}