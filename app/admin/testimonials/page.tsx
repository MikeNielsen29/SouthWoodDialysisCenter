"use client"

import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'

export default function TestimonialsPage() {
  const { testimonials, isLoading, approveTestimonial, rejectTestimonial } = useAuth()

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Testimonial Moderation</h2>

      {isLoading ? (
        <p className="text-neutral-500">Loading testimonials...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="p-3 text-left text-orange-600 font-medium">Patient</th>
                <th className="p-3 text-left text-orange-600 font-medium">Rating</th>
                <th className="p-3 text-left text-orange-600 font-medium">Comment</th>
                <th className="p-3 text-left text-orange-600 font-medium">Status</th>
                <th className="p-3 text-left text-orange-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial: any) => (
                <tr key={testimonial.id} className="border-b border-neutral-200">
                  <td className="p-3">{testimonial.patientName}</td>
                  <td className="p-3">
                    <span className="text-orange-500">
                      { '★'.repeat(testimonial.rating) }{ '☆'.repeat(5 - testimonial.rating) }
                    </span>
                  </td>
                  <td className="p-3">{testimonial.comment?.substring(0, 60)}${
                  testimonial.comment?.length > 60 ? '...' : ''
                }</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        testimonial.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : testimonial.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {testimonial.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 text-xs text-teal-600 hover:bg-teal-100 rounded transition-colors"
                        onClick={() => approveTestimonial(testimonial.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="px-2 py-1 text-xs text-orange-600 hover:bg-orange-100 rounded transition-colors"
                        onClick={() => rejectTestimonial(testimonial.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Button variant="gradient" className="mt-2">
          Refresh
        </Button>
      </div>
    </div>
  )
}