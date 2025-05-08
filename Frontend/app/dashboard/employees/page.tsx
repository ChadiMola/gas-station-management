import { EmployeeManagement } from "@/components/dashboard/employee-management"

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Employés</h2>
        <p className="text-muted-foreground">Gérez les employés et leurs salaires.</p>
      </div>
      <EmployeeManagement />
    </div>
  )
}
