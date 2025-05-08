"use client"

import { useState } from "react"
import { useGasStation } from "@/context/gas-station-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileBarChart, Download, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateCSV, downloadCSV, filterTransactionsByShift, type Shift } from "@/utils/csv-export"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

// Update the component to include shift selection and download functionality
export function SalesReport() {
  const { getFilteredTransactions, deleteTransaction, editTransaction, state } = useGasStation()
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [shift, setShift] = useState<Shift>("all")
  const [transactions, setTransactions] = useState(getFilteredTransactions(startDate, endDate))
  const [editingTransaction, setEditingTransaction] = useState<{
    pumpId: number | null
    transactionId: string | null
    currentIndex: string
  }>({ pumpId: null, transactionId: null, currentIndex: "" })

  const handleSearch = () => {
    setTransactions(getFilteredTransactions(startDate, endDate))
  }

  const filteredTransactions = filterTransactionsByShift(transactions, shift)

  // Calculate totals based on filtered transactions
  const totalLiters = filteredTransactions.reduce((sum, t) => sum + t.litersDispensed, 0)
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.revenue, 0)

  const handleDownload = () => {
    const csv = generateCSV(filteredTransactions, state.pumps)
    const shiftText = shift === "all" ? "Journée-Complète" : shift === "morning" ? "Équipe-Matin" : "Équipe-Nuit"
    const filename = `Rapport-Station-Service-${startDate}-à-${endDate}-${shiftText}.csv`
    downloadCSV(csv, filename)
  }

  // Format date in French
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    const [pumpId, actualTransactionId] = transactionId.split("-")
    if (pumpId && actualTransactionId) {
      deleteTransaction(Number.parseInt(pumpId), actualTransactionId)
      // Refresh the transactions list
      setTransactions(getFilteredTransactions(startDate, endDate))
    }
  }

  const startEditTransaction = (transactionId: string, currentIndex: number) => {
    const [pumpId, actualTransactionId] = transactionId.split("-")
    if (pumpId && actualTransactionId) {
      setEditingTransaction({
        pumpId: Number.parseInt(pumpId),
        transactionId: actualTransactionId,
        currentIndex: currentIndex.toString(),
      })
    }
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
        // Refresh the transactions list
        setTransactions(getFilteredTransactions(startDate, endDate))
      }
    }

    // Reset editing state
    setEditingTransaction({ pumpId: null, transactionId: null, currentIndex: "" })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rapport de Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="start-date" className="text-sm font-medium">
                Date de Début
              </label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="end-date" className="text-sm font-medium">
                Date de Fin
              </label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="shift" className="text-sm font-medium">
                Équipe
              </label>
              <Select value={shift} onValueChange={(value) => setShift(value as Shift)}>
                <SelectTrigger id="shift">
                  <SelectValue placeholder="Sélectionner équipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Équipes</SelectItem>
                  <SelectItem value="morning">Matin (6h-18h)</SelectItem>
                  <SelectItem value="night">Nuit (18h-6h)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle>Détails des Transactions</CardTitle>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div>
              <span className="font-medium">Total Litres:</span> {totalLiters.toFixed(2)} L
            </div>
            <div>
              <span className="font-medium">Total Revenu:</span> {totalRevenue.toFixed(2)} TND
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={filteredTransactions.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Pompe</TableHead>
                  <TableHead>Index Précédent</TableHead>
                  <TableHead>Index Actuel</TableHead>
                  <TableHead>Litres</TableHead>
                  <TableHead>Prix/L</TableHead>
                  <TableHead>Revenu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  // Extract pump ID from the transaction ID
                  const [pumpId] = transaction.id.split("-")

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>Pompe {pumpId}</TableCell>
                      <TableCell>{transaction.previousIndex.toFixed(2)}</TableCell>
                      <TableCell>{transaction.currentIndex.toFixed(2)}</TableCell>
                      <TableCell>{transaction.litersDispensed.toFixed(2)} L</TableCell>
                      <TableCell>{transaction.pricePerLiter.toFixed(2)} TND</TableCell>
                      <TableCell>{transaction.revenue.toFixed(2)} TND</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => startEditTransaction(transaction.id, transaction.currentIndex)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileBarChart className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune transaction trouvée</h3>
              <p className="text-sm text-muted-foreground">
                Essayez d'ajuster votre plage de dates ou sélection d'équipe pour voir plus de résultats.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
