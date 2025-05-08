import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Settings } from "@/components/dashboard/settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Paramètres" />
      <Settings />
    </div>
  )
}
