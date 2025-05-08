import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PumpGrid } from "@/components/dashboard/pump-grid"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Gestion des Pompes" />
      <PumpGrid />
    </div>
  )
}
