"use client"

import { useState } from "react"
import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FuelIcon as GasPump, Save, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function PricingManagement() {
  const { state, updatePumpPrice } = useGasStation()
  const [newPrices, setNewPrices] = useState<{ [key: number]: string }>({})

  const handlePriceChange = (pumpId: number, value: string) => {
    setNewPrices((prev) => ({ ...prev, [pumpId]: value }))
  }

  const handleSubmit = (pumpId: number) => {
    const newPrice = Number.parseFloat(newPrices[pumpId] || "0")
    if (newPrice > 0) {
      updatePumpPrice(pumpId, newPrice)
      setNewPrices((prev) => ({ ...prev, [pumpId]: "" }))
    }
  }

  const getPriceChangeIcon = (pumpId: number) => {
    const newPrice = Number.parseFloat(newPrices[pumpId] || "0")
    if (newPrice === 0 || isNaN(newPrice)) return null

    const currentPrice = state.pumps.find((p) => p.id === pumpId)?.pricePerLiter || 0

    if (newPrice > currentPrice) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (newPrice < currentPrice) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    }

    return null
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-500" />
          Gestion des Prix de Carburant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead>Pompe</TableHead>
              <TableHead>Prix Actuel (TND/L)</TableHead>
              <TableHead>Nouveau Prix (TND/L)</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.pumps.map((pump) => (
              <TableRow key={pump.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <GasPump className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    {pump.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{pump.pricePerLiter.toFixed(2)} TND</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newPrices[pump.id] || ""}
                      onChange={(e) => handlePriceChange(pump.id, e.target.value)}
                      placeholder="Entrer nouveau prix"
                      className="max-w-[150px]"
                    />
                    {getPriceChangeIcon(pump.id)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleSubmit(pump.id)}
                    disabled={!newPrices[pump.id] || Number.parseFloat(newPrices[pump.id]) <= 0}
                    variant="default"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
