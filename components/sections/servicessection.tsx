import Image from 'next/image'

export function ServicesSection() {
  return (
    <section className="py-24 sm:py-32 lg:py-48 bg-[linear-gradient(135deg,var(--support-gradient))] text-neutral-900">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4">Our Services</h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            We offer comprehensive dialysis and supportive care services tailored to
            each patient's unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dialysis Services Card 1 */}
          <div className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-orange-200/50">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors mb-4">
              <svg className="h-6 w-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </center>
            <h3 className="text-xl font-medium mb-2">Hemodialysis</h3>
            <p className="text-neutral-600 text-sm">
              Advanced hemodialysis treatment using cutting-edge equipment for
              efficient blood filtration.
            </p>
          </div>

          {/* Dialysis Services Card 2 */}
          <div className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-teal-200/50">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-500 transition-colors mb-4">
              <svg className="h-6 w-6 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Peritoneal Dialysis</h3>
            <p className="text-neutral-600 text-sm">
              Home-based dialysis solution using the peritoneal membrane for natural
              filtration.
            </p>
          </div>

          {/* Dialysis Services Card 3 */}
          <div className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border-green-200/50">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors mb-4">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Kidney Transplant Evaluation</h3>
            <p className="text-neutral-600 text-sm">
              Comprehensive evaluation and coordination for kidney transplantation.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}