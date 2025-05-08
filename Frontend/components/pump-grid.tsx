"use client"

import { useState } from "react"
import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FuelIcon as GasPump, ArrowRight, Edit, Check, X, History, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PumpGrid() {
  const { state, updatePumpIndex, updatePumpName, deleteTransaction, editTransaction } = useGasStation()
  const [newIndexes, setNewIndexes] = useState<{ [key: number]: string }>({})
  const [editingName, setEditingName] = useState<{ [key: number]: boolean }>({})
  const [newNames, setNewNames] = useState<{ [key: number]: string }>({})
  const [editingTransaction, setEditingTransaction] = useState<{
    pumpId: number | null
    transactionId: string | null
    currentIndex: string
  }>({ pumpId: null, transactionId: null, currentIndex: "" })

  const handleIndexChange = (pumpId: number, value: string) => {
    setNewIndexes((prev) => ({ ...prev, [pumpId]: value }))
  }

  const handleSubmit = (pumpId: number) => {
    const newIndex = Number.parseFloat(newIndexes[pumpId] || "0")
    if (newIndex > state.pumps[pumpId - 1].currentIndex) {
      updatePumpIndex(pumpId, newIndex)
      setNewIndexes((prev) => ({ ...prev, [pumpId]: "" }))
    }
  }

  const startEditingName = (pumpId: number) => {
    setNewNames((prev) => ({
      ...prev,
      [pumpId]: state.pumps.find((p) => p.id === pumpId)?.name || `Pompe ${pumpId}`,
    }))
    setEditingName((prev) => ({ ...prev, [pumpId]: true }))
  }

  const saveName = (pumpId: number) => {
    if (newNames[pumpId] && newNames[pumpId].trim() !== "") {
      updatePumpName(pumpId, newNames[pumpId])
    }
    setEditingName((prev) => ({ ...prev, [pumpId]: false }))
  }

  const cancelEditName = (pumpId: number) => {
    setEditingName((prev) => ({ ...prev, [pumpId]: false }))
  }

  const handleDeleteTransaction = (pumpId: number, transactionId: string) => {
    deleteTransaction(pumpId, transactionId)
  }

  const startEditTransaction = (pumpId: number, transactionId: string, currentIndex: number) => {
    setEditingTransaction({
      pumpId,
      transactionId,
      currentIndex: currentIndex.toString(),
    })
  }

  const saveTransactionEdit = () => {
    if (
      editingTransaction.pumpId !== null &&
      editingTransaction.transactionId !== null &&
      editingTransaction.currentIndex
    ) {
      const newIndex = Number.parseFloat(editingTransaction.currentIndex)
      if (!isNaN(newIndex) && newIndex > 0) {
        editTransaction(editingTransaction.pumpId, editingTransaction.transactionId, newIndex)
      }
    }

    // Reset editing state
    setEditingTransaction({ pumpId: null, transactionId: null, currentIndex: "" })
  }

  // Format date in French
  const formatDate = (dateString: string) => {
    if (!dateString) return "Jamais"
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.pumps.map((pump) => {
        const litersDispensed = pump.currentIndex - pump.previousIndex
        const revenue = litersDispensed * pump.pricePerLiter

        return (
          <Card key={pump.id} className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center justify-between">
                {editingName[pump.id] ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={newNames[pump.id] || ""}
                      onChange={(e) => setNewNames((prev) => ({ ...prev, [pump.id]: e.target.value }))}
                      className="h-8"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={() => saveName(pump.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => cancelEditName(pump.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <CardTitle className="flex items-center gap-2">
                    <GasPump className="h-5 w-5" />
                    {pump.name}
                    <Button size="icon" variant="ghost" onClick={() => startEditingName(pump.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                )}
              </div>
              <CardDescription>Prix: {pump.pricePerLiter.toFixed(2)} TND/L</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Index Précédent</div>
                    <div>{pump.previousIndex.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Index Actuel</div>
                    <div>{pump.currentIndex.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Litres Distribués</div>
                    <div>{litersDispensed.toFixed(2)} L</div>
                  </div>
                  <div>
                    <div className="font-medium">Revenu</div>
                    <div>{revenue.toFixed(2)} TND</div>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label htmlFor={`new-index-${pump.id}`} className="text-sm font-medium">
                      Nouvelle Lecture d'Index
                    </label>
                    <Input
                      id={`new-index-${pump.id}`}
                      type="number"
                      min={pump.currentIndex}
                      step="0.01"
                      value={newIndexes[pump.id] || ""}
                      onChange={(e) => handleIndexChange(pump.id, e.target.value)}
                      placeholder="Entrer nouvelle lecture"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit(pump.id)}
                    disabled={!newIndexes[pump.id] || Number.parseFloat(newIndexes[pump.id]) <= pump.currentIndex}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour:{" "}
                {pump.transactions.length > 0
                  ? formatDate(pump.transactions[pump.transactions.length - 1].date)
                  : "Jamais"}
              </div>

              {pump.transactions.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <History className="h-4 w-4 mr-1" />
                      <span className="text-xs">Historique</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Historique des Transactions - {pump.name}</DialogTitle>
                      <DialogDescription>
                        Consultez et modifiez l'historique des transactions pour cette pompe.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Index Précédent</TableHead>
                            <TableHead>Index Actuel</TableHead>
                            <TableHead>Litres</TableHead>
                            <TableHead>Revenu</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pump.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{formatDate(transaction.date)}</TableCell>
                              <TableCell>{transaction.previousIndex.toFixed(2)}</TableCell>
                              <TableCell>{transaction.currentIndex.toFixed(2)}</TableCell>
                              <TableCell>{transaction.litersDispensed.toFixed(2)} L</TableCell>
                              <TableCell>{transaction.revenue.toFixed(2)} TND</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      startEditTransaction(pump.id, transaction.id, transaction.currentIndex)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDeleteTransaction(pump.id, transaction.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        )
      })}

      {/* Dialog for editing transaction */}
      <Dialog
        open={editingTransaction.pumpId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction({ pumpId: null, transactionId: null, currentIndex: "" })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Transaction</DialogTitle>
            <DialogDescription>Corrigez l'index actuel pour cette transaction.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="current-index" className="text-right">
                Nouvel Index:
              </label>
              <Input
                id="current-index"
                type="number"
                step="0.01"
                value={editingTransaction.currentIndex}
                onChange={(e) =>
                  setEditingTransaction((prev) => ({
                    ...prev,
                    currentIndex: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={saveTransactionEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
