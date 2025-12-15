import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Detailed analytics and reports for your Status Shop.
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Coming Soon</h3>
            <p className="text-gray-600">
              Advanced analytics and reporting features are being developed. This will include:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Sales reports and revenue analysis</li>
              <li>• Customer behavior analytics</li>
              <li>• Product performance metrics</li>
              <li>• Order trend analysis</li>
              <li>• Export capabilities for reports</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}