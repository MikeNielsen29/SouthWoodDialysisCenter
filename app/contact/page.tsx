import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <section className="py-24 sm:py-32 lg:py-48 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-orange-600 mb-6">
              Contact Us
            </h1>
            <p className="text-neutral-600 text-lg mb-8">
              We're here to help you. Contact us today to schedule a consultation
              or learn more about our services.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 border-rounded-xl bg-neutral-50">
                <MapPin className="h-5 w-5 text-orange-500 mb-3" />
                <h3 className="font-medium text-orange-600 mb-1">Address</h3>
                <p className="text-neutral-600">123 Kidney Avenue, Medical City<br />
                  Southwood Medical Complex</p>
              </div>
              <div className="p-4 border-rounded-xl bg-neutral-50">
                <Phone className="h-5 w-5 text-orange-500 mb-3" />
                <h3 className="font-medium text-orange-600 mb-1">Hotline</h3>
                <p className="text-neutral-600">+63 2 777 8888</p>
              </div>
              <div className="p-4 border-rounded-xl bg-neutral-50">
                <Mail className="h-5 w-5 text-orange-500 mb-3" />
                <h3 className="font-medium text-orange-600 mb-1">Email</h3>
                <p className="text-neutral-600">info@southwood-dc.com</p>
              </div>
              <div className="p-4 border-rounded-xl bg-neutral-50">
                <Clock className="h-5 w-5 text-orange-500 mb-3" />
                <h3 className="font-medium text-orange-600 mb-1">Hours</h3>
                <p className="text-neutral-600">
                  Mon - Fri: 8:00 AM - 6:00 PM<br />
                  Sat: 8:00 AM - 12:00 PM
                </p>
              </div>
            </div>

            <div>
              <Button
                asChild
                className="w-full py-3 mt-4"
              >
                <a href="tel:+6327778888" className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.02 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.02-8.67L2 5a2 2 0 0 1 2-2h3.08" />
                  </svg>
                  <span>Call Now</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Map Section */}
          <div>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ height: '400px' }}>
              {/* Map will be embedded via Google Maps API */}
              <div
                id="google-map"
                className="w-full h-full"
                style={{
                  background: 'var(--support-gradient)',
                  borderRadius: 'inherit'
                }}
              >
                <!-- Google Maps iframe will be inserted by JS -->
                <p className="text-neutral-500 text-center py-20">
                  Google Map will load here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16 pt-16 border-t border-neutral-200">
          <h2 className="text-3xl font-bold text-orange-600 mb-6">Send Us a Message</h2>
          <p className="text-neutral-600 mb-8">
            Have a question? Fill out the form below and we'll get back to you
            within 24 hours.
          </p>
          {/* Form will be implemented with form submission */}
          <p className="text-neutral-500 text-sm">Form functionality coming soon.</p>
        </div>
      </div>
    </section>
  )
}