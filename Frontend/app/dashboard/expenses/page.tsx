import { ExpenseManagement } from "@/components/dashboard/expense-management"

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Dépenses</h2>
        <p className="text-muted-foreground">Suivez et gérez les dépenses de votre station-service.</p>
      </div>
      <ExpenseManagement />
    </div>
  )
}
