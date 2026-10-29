import { useAuth } from '@/lib/auth'

export default function InquiriesPage() {
  const { inquiries, isLoading } = useAuth()

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Inquiry Hub</h2>

      {isLoading ? (
        <p className="text-neutral-500">Loading inquiries...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="p-3 text-left text-orange-600 font-medium">Name</th>
                <th className="p-3 text-left text-orange-600 font-medium">Control Number</th>
                <th className="p-3 text-left text-orange-600 font-medium">Email</th>
                <th className="p-3 text-left text-orange-600 font-medium">Subject</th>
                <th className="p-3 text-left text-orange-600 font-medium">Message</th>
                <th className="p-3 text-left text-orange-600 font-medium">Status</th>
                <th className="p-3 text-left text-orange-600 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry: any) => (
                <tr key={inquiry.id} className="border-b border-neutral-200">
                  <td className="p-3">{inquiry.name}</td>
                  <td className="p-3">{inquiry.controlNumber}</td>
                  <td className="p-3">{inquiry.email}</td>
                  <td className="p-3">{inquiry.subject}</td>
                  <td className="p-3">{inquiry.message?.substring(0, 50)}${inquiry.message.length > 50 ? '...' : ''}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        inquiry.status === 'New'
                          ? 'bg-orange-100 text-orange-800'
                          : inquiry.status === 'Read'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="p-3">{inquiry.createdAt}</td>
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