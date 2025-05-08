"use client"

import { useState } from "react"
import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FuelIcon as GasPump, Save } from "lucide-react"

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Prix de Carburant</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pompe</TableHead>
              <TableHead>Prix Actuel (TND/L)</TableHead>
              <TableHead>Nouveau Prix (TND/L)</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.pumps.map((pump) => (
              <TableRow key={pump.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <GasPump className="h-4 w-4" />
                    {pump.name}
                  </div>
                </TableCell>
                <TableCell>{pump.pricePerLiter.toFixed(2)} TND</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newPrices[pump.id] || ""}
                    onChange={(e) => handlePriceChange(pump.id, e.target.value)}
                    placeholder="Entrer nouveau prix"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleSubmit(pump.id)}
                    disabled={!newPrices[pump.id] || Number.parseFloat(newPrices[pump.id]) <= 0}
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
