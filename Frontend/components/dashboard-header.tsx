"use client"

import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, DollarSign } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
  const { state } = useGasStation()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion de Station-Service</h1>
        <ModeToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carburant Total Distribué</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.totalLitersDispensed.toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">Litres totaux distribués par toutes les pompes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.totalRevenue.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Revenu total de toutes les ventes de carburant</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
