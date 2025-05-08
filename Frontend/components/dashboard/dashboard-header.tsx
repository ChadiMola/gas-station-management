"use client"

import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, DollarSign } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  showStats?: boolean
}

export function DashboardHeader({ title, showStats = true }: DashboardHeaderProps) {
  const { state } = useGasStation()

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

      {showStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carburant Total Distribué</CardTitle>
              <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.totalLitersDispensed.toFixed(2)} L</div>
              <p className="text-xs text-muted-foreground">Litres totaux distribués par toutes les pompes</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.totalRevenue.toFixed(2)} TND</div>
              <p className="text-xs text-muted-foreground">Revenu total de toutes les ventes de carburant</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
