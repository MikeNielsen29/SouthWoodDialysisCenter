import { useAuth } from '@/lib/auth'

export default function AnalyticsPage() {
  const { analyticsData, isLoading } = useAuth()

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Analytics Dashboard</h2>

      {isLoading ? (
        <p className="text-neutral-500">Loading analytics data...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Total Patients Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-orange-500 text-lg mb-3">Total Patients</h3>
            <p className="text-4xl font-bold text-orange-600">
              {analyticsData?.totalPatients || 0}
            </p>
            <p className="text-neutral-500 text-sm">Active patients receiving treatment</p>
          </div>

          {/* Monthly Treatments Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-teal-500 text-lg mb-3">Monthly Treatments</h3>
            <p className="text-teal-600 text-4xl font-bold">
              {analyticsData?.monthlyTreatments || 0}
            </p>
            <p className="text-neutral-500 text-sm">Total dialysis sessions this month</p>
          </div>

          {/* Treatment Success Rate */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 md:w-1/2">
            <h3 className="text-emerald-500 text-lg mb-3">Success Rate</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-emerald-600 text-3xl font-bold">{analyticsData?.successRate || '0'}%</p>
              <p className="text-neutral-500 text-sm">of patients improved</p>
            </div>
            <div className="mt-3 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-width"
                style={{ width: `${analyticsData?.successRate || 0}%` }}
              />
            </div>
          </div>

          {/* Average Treatment Time */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-neutral-500 text-lg mb-3">Avg. Treatment Time</h3>
            <p className="text-neutral-600 text-lg">
              {analyticsData?.avgTreatmentTime || '0'} minutes
            </p>
            <p className="text-neutral-500 text-sm">Average per session</p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button variant="gradient" className="mt-2">
          Refresh Data
        </Button>
      </div>
    </div>
  )
}