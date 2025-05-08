import { InventoryManagement } from "@/components/dashboard/inventory-management"
import { InventorySales } from "@/components/dashboard/inventory-sales"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion de Stock</h2>
        <p className="text-muted-foreground">Gérez l'inventaire des huiles et filtres de votre station-service.</p>
      </div>
      <InventorySales />
      <InventoryManagement />
    </div>
  )
}
