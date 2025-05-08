import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SalesReport } from "@/components/dashboard/sales-report"
import { AutoReportGenerator } from "@/components/dashboard/auto-report-generator"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Rapports de Vente" />
      <AutoReportGenerator />
      <SalesReport />
    </div>
  )
}
